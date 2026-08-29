import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { LayoutGrid, Rows3, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CatalogFilters, useCatalogFilter, type FilterState } from "@/components/site/CatalogFilters";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCTS } from "@/data/products";
import { useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/catalog")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { q?: string; vol?: string; neck?: string; category?: string } => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
    vol: typeof search["vol"] === "string" ? (search["vol"] as string) : undefined,
    neck: typeof search["neck"] === "string" ? (search["neck"] as string) : undefined,
    category: typeof search["category"] === "string" ? (search["category"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Catalog — jars, closures, discs & add-ons | Taral Direct" },
      {
        name: "description",
        content:
          "Filter plastic jars and closures by category, fill volume, neck finish, color, and stocking status. Request samples or a quote.",
      },
      { property: "og:title", content: "Packaging catalog workbench — Taral Direct" },
      {
        property: "og:description",
        content:
          "Specification-first catalog of regular, thick, and double wall jars plus matching closures and discs.",
      },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const search = Route.useSearch();
  const { addSample } = useDemo();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<FilterState>({
    q: search.q ?? "",
    category: search.category ?? "any",
    volume: search.vol ?? "any",
    neck: search.neck ?? "any",
    color: "any",
    stock: "any",
  });

  const results = useCatalogFilter(PRODUCTS, filters);

  const chips = useMemo(() => {
    const out: { key: keyof FilterState; label: string }[] = [];
    if (filters.q) out.push({ key: "q", label: `“${filters.q}”` });
    if (filters.category !== "any") out.push({ key: "category", label: filters.category });
    if (filters.volume !== "any") out.push({ key: "volume", label: filters.volume });
    if (filters.neck !== "any") out.push({ key: "neck", label: filters.neck });
    if (filters.color !== "any") out.push({ key: "color", label: filters.color });
    if (filters.stock !== "any") out.push({ key: "stock", label: filters.stock });
    return out;
  }, [filters]);

  const clear = (key: keyof FilterState) =>
    setFilters((f) => ({ ...f, [key]: key === "q" ? "" : "any" }));

  const reset = () =>
    setFilters({ q: "", category: "any", volume: "any", neck: "any", color: "any", stock: "any" });

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="border-b border-border pb-5">
        <p className="label-caps text-muted-foreground">Product workbench</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Catalog</h1>
        <p className="measure mt-2 text-sm text-muted-foreground">
          Public pricing appears where Taral publishes it. Everything else routes to a quote. Case
          counts, dimensions, and finishes are the specification of record.
        </p>
      </div>

      <div className="grid gap-8 pt-6 lg:grid-cols-[264px_1fr]">
        <CatalogFilters filters={filters} onChange={setFilters} products={PRODUCTS} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
            <div className="flex min-w-56 flex-1 items-center gap-2 border border-input bg-card px-3">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <label className="sr-only" htmlFor="catalog-search">
                Search catalog
              </label>
              <Input
                id="catalog-search"
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                placeholder="Item code, size, finish, material…"
                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <p className="spec-note">
              {results.length} of {PRODUCTS.length} items
            </p>
            <div
              role="group"
              aria-label="Result layout"
              className="ml-auto flex border border-border"
            >
              <button
                onClick={() => setView("grid")}
                aria-pressed={view === "grid"}
                className={`flex size-9 items-center justify-center ${
                  view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                className={`flex size-9 items-center justify-center border-l border-border ${
                  view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
                aria-label="List view"
              >
                <Rows3 className="size-4" />
              </button>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="flex flex-wrap items-center gap-2 py-4">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button
                    onClick={() => clear(chip.key)}
                    className="label-caps inline-flex items-center gap-1.5 border border-border px-2 py-1 text-muted-foreground hover:border-foreground hover:text-foreground"
                  >
                    {chip.label}
                    <X className="size-3" aria-hidden="true" />
                    <span className="sr-only">Remove filter</span>
                  </button>
                </li>
              ))}
              <li>
                <button onClick={reset} className="label-caps text-accent hover:underline">
                  Clear all
                </button>
              </li>
            </ul>
          )}

          {results.length === 0 ? (
            <div className="mt-6 border border-dashed border-border p-10 text-center">
              <h2 className="font-display text-lg font-semibold">No items match this spec</h2>
              <p className="measure mx-auto mt-2 text-sm text-muted-foreground">
                Taral molds sizes from 1/8 oz through 32 oz, and custom colors or printing are
                quoted per run. Loosen a filter, or send the specification and we'll come back with
                options.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={reset}>
                  Reset filters
                </Button>
                <Button
                  variant="accent"
                  onClick={() =>
                    toast.info("Prototype only", {
                      description: "A quote request would open here. Nothing is transmitted.",
                    })
                  }
                >
                  Request a quote
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={
                view === "grid"
                  ? "mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  : "mt-6 flex flex-col gap-3"
              }
            >
              {results.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  view={view}
                  mode="public"
                  action={
                    product.stock === "Made to order" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast.info("Quote request (prototype)", {
                            description: `${product.code} would be routed to customer service. Nothing is transmitted.`,
                          })
                        }
                      >
                        Request quote
                      </Button>
                    ) : (
                      <Button
                        size="sm"
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
                        Add to sample request
                      </Button>
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
