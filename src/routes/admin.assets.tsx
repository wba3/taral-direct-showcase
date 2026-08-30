import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Download, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DemoTag } from "@/components/site/DemoTag";
import { runHarvest } from "@/lib/harvest.functions";
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
  const queryClient = useQueryClient();
  const harvest = useServerFn(runHarvest);

  const { data, isLoading } = useQuery({
    queryKey: ["site-asset-index"],
    queryFn: () => getSiteAssetIndex(),
  });

  const mutation = useMutation({
    mutationFn: () => harvest(),
    onSuccess: (result) => {
      if (result.ok) toast.success("Harvest complete", { description: result.message });
      else toast.warning("Harvest finished with notes", { description: result.message });
      void queryClient.invalidateQueries({ queryKey: ["site-asset-index"] });
    },
    onError: (error) =>
      toast.error("Harvest failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      }),
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
            files in this project's backend, and serves them from a stable URL. Re-running is safe —
            files already stored are skipped.
          </p>
        </div>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? (
            <RefreshCw className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {mutation.isPending ? "Harvesting…" : "Harvest site imagery"}
        </Button>
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

      {mutation.data?.summary && (
        <div className="mt-6 border border-border p-5">
          <h2 className="font-display text-base font-semibold">Last run</h2>
          <p className="spec-note mt-1">
            {mutation.data.summary.pages} pages · {mutation.data.summary.imagesFound} images found ·{" "}
            {mutation.data.summary.imagesStored} stored · {mutation.data.summary.imagesSkipped}{" "}
            already present · {mutation.data.summary.products} listings
          </p>
          {mutation.data.summary.errors.length > 0 && (
            <ul className="mt-3 space-y-1">
              {mutation.data.summary.errors.slice(0, 12).map((error) => (
                <li key={error} className="spec-note text-accent">
                  {error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading library…</p>}

      {!isLoading && assets.length === 0 && (
        <p className="measure mt-8 text-sm text-muted-foreground">
          Nothing stored yet. Run the harvest to pull the real site graphics into this project.
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
