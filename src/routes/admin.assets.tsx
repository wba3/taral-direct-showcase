import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { DemoTag } from "@/components/site/DemoTag";
import { getSiteAssetIndex } from "@/lib/site-assets.functions";

export const Route = createFileRoute("/admin/assets")({
  head: () => ({
    meta: [
      { title: "Asset library — harvested taralplastics.com imagery | Taral Direct" },
      {
        name: "description",
        content:
          "Internal tool: pull the public taralplastics.com graphics and product listings into the Taral Direct backend and review what has been stored.",
      },
      { property: "og:title", content: "Asset library — Taral Direct" },
      {
        property: "og:description",
        content: "Review the real site imagery stored for the Taral Direct prototype.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AssetLibrary,
});

function AssetLibrary() {
  const { data, isLoading } = useQuery({
    queryKey: ["site-asset-index"],
    queryFn: () => getSiteAssetIndex(),
  });

  const assets = data?.assets ?? [];
  const products = data?.products ?? [];
  const totalBytes = assets.reduce((sum, asset) => sum + (asset.byteSize ?? 0), 0);
  const grouped = ["category", "product", "logo", "other"].map((kind) => ({
    kind,
    items: assets.filter((asset) => asset.kind === kind),
  }));

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="label-caps text-muted-foreground">Internal tool</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">Asset library</h1>
          <p className="measure mt-3 text-sm text-muted-foreground">
            Pulls graphics and product listings from the public taralplastics.com pages, stores the
            files in this project's backend, and serves them from a stable URL. The import already
            ran; it is now switched off because it needs authenticated staff access, which this
            prototype does not have.
          </p>
        </div>
      </div>

      <dl className="grid gap-px border-b border-border bg-border sm:grid-cols-3">
        {[
          ["Files stored", assets.length.toLocaleString()],
          ["Product listings indexed", products.length.toLocaleString()],
          ["Total size", `${(totalBytes / 1024 / 1024).toFixed(2)} MB`],
        ].map(([label, value]) => (
          <div key={label} className="bg-card p-5">
            <dt className="label-caps text-muted-foreground">{label}</dt>
            <dd className="tabular mt-1 font-display text-2xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading library…</p>}

      {!isLoading && assets.length === 0 && (
        <p className="measure mt-8 text-sm text-muted-foreground">
          Nothing stored yet.
        </p>
      )}

      {grouped.map(
        ({ kind, items }) =>
          items.length > 0 && (
            <section key={kind} aria-labelledby={`kind-${kind}`} className="py-8">
              <div className="flex items-center gap-3">
                <h2 id={`kind-${kind}`} className="font-display text-xl font-bold tracking-tight">
                  {kind === "category"
                    ? "Category graphics"
                    : kind === "product"
                      ? "Product photography"
                      : kind === "logo"
                        ? "Brand marks"
                        : "Other graphics"}
                </h2>
                <DemoTag tone="neutral">From taralplastics.com</DemoTag>
                <span className="spec-note">{items.length} files</span>
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-px bg-border sm:grid-cols-4 lg:grid-cols-6">
                {items.map((asset) => (
                  <li key={asset.sourceUrl} className="bg-card p-3">
                    <img
                      src={asset.publicUrl}
                      alt={asset.altText ?? "Harvested graphic from taralplastics.com"}
                      loading="lazy"
                      className="aspect-square w-full bg-secondary object-contain p-2"
                    />
                    <p className="spec-note mt-2 truncate" title={asset.sourceUrl}>
                      {asset.sourceUrl.split("/").pop()}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ),
      )}
    </div>
  );
}
