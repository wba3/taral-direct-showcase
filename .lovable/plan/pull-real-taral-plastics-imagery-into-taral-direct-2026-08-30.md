# Pull real Taral Plastics imagery into Taral Direct

Replace the generated placeholder art with the actual photography and product data from
taralplastics.com, stored in Lovable Cloud so the prototype references real assets instead
of AI-generated stand-ins.

## What gets built

**1. Backend (Lovable Cloud + Firecrawl)**

- Enable Lovable Cloud: a public storage bucket for the harvested imagery plus a
  `site_assets` table that indexes every file (source page, original URL, stored path,
  kind: logo / category / product / other, alt text, width/height, checksum).
- Add a `scraped_products` table for the product data found on the site (name, code,
  size, neck finish, material, category, source page, image reference).
- Connect the Firecrawl connector for the crawl.

**2. Harvest step (admin-triggered, run once)**

- A protected server function maps taralplastics.com, then scrapes the category pages
  (Regular Wall, Thick Wall, Double Wall, Lids & Closures, Discs & Dust Covers, Add-Ons,
  Big Packaging) plus home/about/contact.
- Every image reference found (including the S3-hosted product photos such as
  `hatchery.s3.us-west-2.amazonaws.com/taralplastics/...`), the logo, and any other site
  graphics are downloaded and uploaded into the storage bucket, with a row written to
  `site_assets`. Re-running is idempotent: same source URL updates rather than duplicates.
- Product rows parsed from the same pages land in `scraped_products`.

**3. Admin harvest screen**

- A small `/admin/assets` page: "Run harvest" button, live counts, and a gallery of every
  stored asset with its source URL, so you can see exactly what came down and confirm
  nothing is missing before the meeting.

**4. Wire the real assets into the prototype**

- Catalog cards, product detail pages, category rails, and the home hero read their
  imagery from `site_assets` (matched by category, then by item code where available),
  falling back to the existing generated images when no real photo exists.
- The real Taral logo replaces the current text-only wordmark treatment in the header.
- Generated `hero-jars.jpg` / `product-detail.jpg` stay as fallbacks only.

**5. Labeling**

- Real imagery and real product data get a `From taralplastics.com` provenance tag,
  alongside the existing `Illustrative` / `Demo data` tags.
- Pricing, inventory, orders, invoices, and the price book stay labeled demo/illustrative —
  none of that exists on the public site, so nothing there changes.
- The integration blueprint gains a short note that catalog imagery and specs are now
  sourced from the live public site, while all operational values remain mock.

## Technical notes

- Firecrawl `map` + `scrape` (formats: `markdown`, `links`, `html`) via the connector;
  gateway vs direct-API mode is determined from the linked connection.
- Image bytes are fetched server-side and written with the Cloud storage client — the
  browser never touches Firecrawl or the storage service role.
- All new tables get explicit GRANTs, RLS on, public `SELECT` for anon (catalog imagery is
  public by nature) and writes restricted to the harvest server function.
- Product-to-image matching is best-effort; unmatched items keep the silhouette + fallback
  photo rather than showing a wrong container.
- Copyright: these are Taral's own assets used in a Taral prototype, so re-hosting them is
  in scope for this demo.

## Out of scope

- No changes to pricing, inventory, orders, invoices, price book, payments, or the guided
  demo flow.
- No live Acumatica connection.
- No scheduled re-crawl; the harvest is manual for now.
