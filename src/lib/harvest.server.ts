/**
 * Harvest of public taralplastics.com imagery and product listings.
 *
 * Server-only. Scrapes the public site with Firecrawl, downloads every image it
 * finds, stores the bytes in the `site-assets` bucket, and indexes them in
 * `site_assets` / `site_products`. Nothing here touches ERP data — the public
 * site is the only source.
 */

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";
const SITE_ORIGIN = "https://taralplastics.com";
const BUCKET = "site-assets";

/** Only these hosts may be downloaded. */
const ALLOWED_HOSTS = new Set(["taralplastics.com", "hatchery.s3.us-west-2.amazonaws.com"]);

export const HARVEST_PAGES: { path: string; category: string }[] = [
  { path: "/", category: "Home" },
  { path: "/regular", category: "Regular Wall Jars" },
  { path: "/thick", category: "Thick Wall Jars" },
  { path: "/double", category: "Double Wall Jars" },
  { path: "/lids-and-closures", category: "Lids & Closures" },
  { path: "/discs-and-dust-covers", category: "Discs & Dust Covers" },
  { path: "/add-ons", category: "Add-ons" },
  { path: "/big-packaging", category: "Big Packaging" },
];

export interface HarvestSummary {
  pages: number;
  imagesFound: number;
  imagesStored: number;
  imagesSkipped: number;
  products: number;
  errors: string[];
}

interface ScrapedPage {
  path: string;
  category: string;
  markdown: string;
  html: string;
}

async function scrapePage(
  path: string,
  apiKey: string,
): Promise<{ markdown: string; html: string }> {
  const response = await fetch(`${FIRECRAWL_V2}/scrape`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      url: `${SITE_ORIGIN}${path}`,
      formats: ["markdown", "html"],
      onlyMainContent: false,
    }),
  });
  const payload = (await response.json()) as {
    error?: string;
    markdown?: string;
    html?: string;
    data?: { markdown?: string; html?: string };
  };
  if (!response.ok) {
    throw new Error(payload.error ?? `Firecrawl responded ${response.status}`);
  }
  return {
    markdown: payload.markdown ?? payload.data?.markdown ?? "",
    html: payload.html ?? payload.data?.html ?? "",
  };
}

function isAllowed(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && ALLOWED_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

/** Every image URL on a page, with its alt text where the HTML provides one. */
function extractImages(page: ScrapedPage): { url: string; alt: string | null }[] {
  const found = new Map<string, string | null>();

  const htmlTag = /<img\b[^>]*>/gi;
  for (const tag of page.html.match(htmlTag) ?? []) {
    const src = /\bsrc=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!src) continue;
    const absolute = src.startsWith("http") ? src : new URL(src, SITE_ORIGIN).toString();
    if (!isAllowed(absolute)) continue;
    const alt = /\balt=["']([^"']*)["']/i.exec(tag)?.[1] ?? null;
    if (!found.has(absolute) || (alt && !found.get(absolute))) {
      found.set(absolute, alt && alt !== "#" ? decodeHtml(alt) : null);
    }
  }

  const mdImage = /!\[[^\]]*\]\((https:\/\/[^)\s]+)\)/g;
  for (const match of page.markdown.matchAll(mdImage)) {
    const url = match[1];
    if (url && isAllowed(url) && !found.has(url)) found.set(url, null);
  }

  return [...found.entries()].map(([url, alt]) => ({ url, alt }));
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function classify(url: string): "logo" | "category" | "product" | "other" {
  if (url.includes("/prodtypes/")) return "category";
  if (url.includes("/images/thumbs/")) return "product";
  if (url.includes("/brand/") || url.includes("logo")) return "logo";
  return "other";
}

export interface ParsedSiteProduct {
  sourceKey: string;
  category: string;
  label: string | null;
  volume: string | null;
  diameter: string | null;
  style: string | null;
  sourcePage: string;
  sourceImageUrl: string;
}

/**
 * The listing pages render each item as an image link followed by a spec link
 * containing `**Volume:**`, `**Diameter:**` and/or `**Style:**` labels.
 */
export function parseProducts(page: ScrapedPage): ParsedSiteProduct[] {
  const results: ParsedSiteProduct[] = [];
  const seen = new Set<string>();
  const blocks = page.markdown.split(/!\[[^\]]*\]\(/).slice(1);

  for (const block of blocks) {
    const url = /^(https:\/\/[^)\s]+)\)/.exec(block)?.[1];
    if (!url || !isAllowed(url) || !url.includes("/images/thumbs/")) continue;
    const window = block.slice(0, 900).replace(/\\\n/g, " ").replace(/\\/g, " ");

    const volume = /\*\*Volume:\*\*\s*([^*[\]\n]+?)\s{2,}/.exec(window)?.[1]?.trim() ?? null;
    const diameter =
      /\*\*Diameter:\*\*\s*([^*[\]\n]+?)(?:\s{2,}|\])/.exec(window)?.[1]?.trim() ?? null;
    const style = /\*\*Style:\*\*\s*([^*[\]\n]+?)(?:\s{2,}|\])/.exec(window)?.[1]?.trim() ?? null;
    const bold = /\[\*\*([^*]+)\*\*\]/.exec(window)?.[1]?.trim() ?? null;

    const label =
      bold && !bold.startsWith("Volume") && !bold.startsWith("Diameter")
        ? bold
        : [volume, diameter, style].filter(Boolean).join(" · ") || null;

    const key = `${page.category}|${volume ?? ""}|${diameter ?? ""}|${style ?? label ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({
      sourceKey: key,
      category: page.category,
      label,
      volume,
      diameter,
      style,
      sourcePage: `${SITE_ORIGIN}${page.path}`,
      sourceImageUrl: url,
    });
  }

  return results;
}

function storagePathFor(url: string): string {
  const parsed = new URL(url);
  const decoded = decodeURIComponent(parsed.pathname)
    .replace(/^\/+/, "")
    .replace(/[^a-zA-Z0-9._/-]+/g, "-")
    .replace(/-+/g, "-");
  return `${parsed.hostname.split(".")[0]}/${decoded}`;
}

export async function runSiteHarvest(): Promise<HarvestSummary> {
  const apiKey = process.env["FIRECRAWL_API_KEY"];
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY is not configured");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const summary: HarvestSummary = {
    pages: 0,
    imagesFound: 0,
    imagesStored: 0,
    imagesSkipped: 0,
    products: 0,
    errors: [],
  };

  const images = new Map<string, { alt: string | null; page: string; category: string }>();
  const products: ParsedSiteProduct[] = [];

  for (const entry of HARVEST_PAGES) {
    try {
      const scraped = await scrapePage(entry.path, apiKey);
      const page: ScrapedPage = { ...entry, ...scraped };
      summary.pages += 1;

      for (const image of extractImages(page)) {
        if (!images.has(image.url)) {
          images.set(image.url, {
            alt: image.alt,
            page: `${SITE_ORIGIN}${entry.path}`,
            category: entry.category,
          });
        }
      }
      products.push(...parseProducts(page));
    } catch (error) {
      summary.errors.push(
        `${entry.path}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  summary.imagesFound = images.size;

  const { data: existingRows } = await supabaseAdmin.from("site_assets").select("source_url");
  const existing = new Set((existingRows ?? []).map((row) => row.source_url));

  for (const [url, meta] of images) {
    if (existing.has(url)) {
      summary.imagesSkipped += 1;
      continue;
    }
    try {
      const response = await fetchImage(url);
      if (!response.ok) throw new Error(`download responded ${response.status}`);
      const contentType = response.headers.get("content-type") ?? "application/octet-stream";
      if (!contentType.startsWith("image/")) throw new Error(`unexpected type ${contentType}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      const path = storagePathFor(url);

      const upload = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, bytes, { contentType, upsert: true });
      if (upload.error) throw upload.error;

      const insert = await supabaseAdmin.from("site_assets").upsert(
        {
          source_url: url,
          source_page: meta.page,
          storage_path: path,
          public_url: `/api/public/site-asset/${path}`,
          kind: classify(url),
          alt_text: meta.alt ?? meta.category,
          content_type: contentType,
          byte_size: bytes.byteLength,
        },
        { onConflict: "source_url" },
      );
      if (insert.error) throw insert.error;
      summary.imagesStored += 1;
    } catch (error) {
      summary.errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (products.length > 0) {
    const rows = products.map((product) => ({
      source_key: product.sourceKey,
      category: product.category,
      label: product.label,
      volume: product.volume,
      diameter: product.diameter,
      style: product.style,
      source_page: product.sourcePage,
      source_image_url: product.sourceImageUrl,
    }));
    const upsert = await supabaseAdmin
      .from("site_products")
      .upsert(rows, { onConflict: "source_key" });
    if (upsert.error) summary.errors.push(`products: ${upsert.error.message}`);
    else summary.products = rows.length;
  }

  return summary;
}

export async function downloadStoredAsset(
  path: string,
): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(path);
  if (error || !data) return null;
  return { body: await data.arrayBuffer(), contentType: data.type || "application/octet-stream" };
}
