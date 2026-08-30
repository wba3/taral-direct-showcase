import { createServerFn } from "@tanstack/react-start";

export interface SiteAssetRow {
  sourceUrl: string;
  publicUrl: string;
  kind: string;
  altText: string | null;
  sourcePage: string | null;
  byteSize: number | null;
}

export interface SiteProductRow {
  category: string;
  label: string | null;
  volume: string | null;
  diameter: string | null;
  style: string | null;
  sourceImageUrl: string | null;
}

export interface SiteAssetIndex {
  assets: SiteAssetRow[];
  products: SiteProductRow[];
}

/** Public read of the harvested index. Anon SELECT policies cover both tables. */
export const getSiteAssetIndex = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteAssetIndex> => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return { assets: [], products: [] };

    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });

    const [assets, products] = await Promise.all([
      supabase
        .from("site_assets")
        .select("source_url, public_url, kind, alt_text, source_page, byte_size")
        .order("kind")
        .order("source_url"),
      supabase
        .from("site_products")
        .select("category, label, volume, diameter, style, source_image_url")
        .order("category"),
    ]);

    return {
      assets: (assets.data ?? []).map((row) => ({
        sourceUrl: row.source_url,
        publicUrl: row.public_url,
        kind: row.kind,
        altText: row.alt_text,
        sourcePage: row.source_page,
        byteSize: row.byte_size,
      })),
      products: (products.data ?? []).map((row) => ({
        category: row.category,
        label: row.label,
        volume: row.volume,
        diameter: row.diameter,
        style: row.style,
        sourceImageUrl: row.source_image_url,
      })),
    };
  },
);
