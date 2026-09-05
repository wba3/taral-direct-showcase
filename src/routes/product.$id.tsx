import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoTag } from "@/components/site/DemoTag";
import { ProductSilhouette } from "@/components/site/ProductSilhouette";
import { PriceState } from "@/components/site/ProductCard";
import { compatibleWith, getProduct, money } from "@/data/products";
import { useDemo } from "@/lib/demo-store";
import { useProductImage } from "@/lib/site-images";
import detailImage from "@/assets/product-detail.jpg";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Item unavailable — Taral Direct" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    const title = `${product.code} · ${product.name} | Taral Direct`;
    const description = `${product.name} — ${product.material}, ${product.neck ?? "no thread finish"}, ${product.caseCount.toLocaleString()} per case. Request samples or a quote.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const { addSample } = useDemo();
  const realImage = useProductImage(product);
  const matches = compatibleWith(product);
  const custom = product.demoUnitPrice === null && product.publicUnitPrice === null;

  const specRows: [string, string][] = [
    ["Item code", product.code],
    ["Category", product.category],
    ["Nominal fill volume", product.size],
    ["Thread finish", product.neck ?? "Not threaded"],
    ["Material", product.material],
    ["Color", product.color],
    ["Case count", `${product.caseCount.toLocaleString()} per case`],
    ["Height", product.dims?.height ?? "—"],
    ["Opening", product.dims?.opening ?? "—"],
    ["Maximum fill", product.dims?.maxFill ?? "—"],
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <Link
        to="/catalog"
        className="label-caps inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to catalog
      </Link>

      <div
        data-demo-target="product"
        className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
      >
        {/* Imagery + silhouette */}
        <div className="lg:sticky lg:top-[73px] lg:self-start">
          <div className="border border-border">
            <img
              src={realImage ?? detailImage}
              alt={`${product.name} — container photograph`}
              width={1200}
              height={1200}
              loading="lazy"
              className={
                realImage
                  ? "aspect-square w-full bg-secondary object-contain p-8"
                  : "aspect-square w-full object-cover"
              }
            />
            <div className="flex items-center gap-4 border-t border-border p-4">
              <ProductSilhouette
                category={product.category}
                label={product.name}
                className="size-16 text-primary"
              />
              <div>
                <DemoTag tone="neutral">
                  {realImage ? "From taralplastics.com" : "Representative photography"}
                </DemoTag>
                <p className="spec-note mt-1">
                  Wall profile notation for {product.category.toLowerCase()}. Confirm exact
                  dimensions against the drawing.
                </p>
              </div>
            </div>
          </div>
          <Button variant="rail" className="mt-3 w-full" asChild>
            <Link to="/contact">Request a technical drawing</Link>
          </Button>
        </div>

        {/* Specification-first column */}
        <div>
          <p className="spec-note text-foreground">{product.code}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="label-caps text-muted-foreground">Confirm availability</span>
            {product.overstock && <DemoTag tone="neutral">Overstock</DemoTag>}
            <DemoTag tone={product.source === "current-site" ? "neutral" : "illustrative"}>
              {product.source === "current-site" ? "From current site" : "Illustrative"}
            </DemoTag>
          </div>

          <div className="mt-6 grid gap-6 border-y border-border py-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <PriceState product={product} mode="public" />
            <div className="flex flex-col gap-2 sm:w-56">
              {custom ? (
                <Button
                  variant="accent"
                  onClick={() =>
                    toast.info("Quote request (prototype)", {
                      description:
                        "Custom colors and printing are quoted per run. Nothing is transmitted.",
                    })
                  }
                >
                  Request quote
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      addSample({
                        productId: product.id,
                        code: product.code,
                        name: product.name,
                      });
                      toast.success("Added to sample request", {
                        description: `${product.code} · demo cart stored locally`,
                      });
                    }}
                  >
                    <FlaskConical className="size-4" /> Add to sample request
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.info("Quote request (prototype)", {
                        description: "Custom color or printing on this item would be quoted.",
                      })
                    }
                  >
                    Request quote — custom color / printing
                  </Button>
                </>
              )}
            </div>
          </div>

          <section aria-labelledby="spec-heading" className="mt-8">
            <h2 id="spec-heading" className="label-caps text-muted-foreground">
              Specification
            </h2>
            <dl className="mt-3 divide-y divide-border border-y border-border">
              {specRows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-2 gap-4 py-2.5">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="spec-note text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
            {product.notes && <p className="spec-note mt-3">{product.notes}</p>}
          </section>

          <section aria-labelledby="ship-heading" className="mt-8">
            <h2 id="ship-heading" className="label-caps text-muted-foreground">
              Shipping & availability
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Stocked items generally ship within one business day.</li>
              <li>
                Available to sell:{" "}
                <span className="tabular text-foreground">
                  {product.availableToSell == null
                    ? "Unconfirmed"
                    : `${product.availableToSell.toLocaleString()} ea`}
                </span>{" "}
                <DemoTag tone="illustrative" />
              </li>
              {product.warehouses?.map((w) => (
                <li key={w.code} className="spec-note">
                  {w.code} · {w.name} — {w.qty.toLocaleString()} ea
                </li>
              ))}
            </ul>
          </section>

          {matches.length > 0 && (
            <section aria-labelledby="match-heading" className="mt-8">
              <h2 id="match-heading" className="label-caps text-muted-foreground">
                Matching {product.neck} components
              </h2>
              <ul className="mt-3 grid gap-px bg-border sm:grid-cols-2">
                {matches.map((m) => (
                  <li key={m.id} className="bg-card">
                    <Link
                      to="/product/$id"
                      params={{ id: m.id }}
                      className="flex items-center gap-3 p-3 hover:bg-secondary"
                    >
                      <ProductSilhouette
                        category={m.category}
                        className="size-10 shrink-0 text-primary"
                      />
                      <span className="min-w-0">
                        <span className="spec-note block text-foreground">{m.code}</span>
                        <span className="block truncate text-sm font-medium">{m.name}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="spec-note mt-3">
                Compatibility is matched on thread finish. Confirm fit with a physical sample before
                committing a fill line.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
