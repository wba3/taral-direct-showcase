import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalShell } from "@/components/portal/PortalShell";
import { DemoTag } from "@/components/site/DemoTag";
import { ProductCard } from "@/components/site/ProductCard";
import {
  CatalogFilters,
  useCatalogFilter,
  type FilterState,
} from "@/components/site/CatalogFilters";
import { PRODUCTS, money } from "@/data/products";
import { ACCOUNT, getAccount } from "@/data/portal";
import { useDemo } from "@/lib/demo-store";
import { services } from "@/lib/adapters/mock";

export const Route = createFileRoute("/portal/catalog")({
  component: PrivateCatalog,
});

function PrivateCatalog() {
  const { accountId, draft, addDraftLine, updateDraft, removeDraft, clearDraft, placeDraftOrder } =
    useDemo();
  const account = getAccount(accountId) ?? ACCOUNT;
  const [filters, setFilters] = useState<FilterState>({
    q: "",
    category: "any",
    volume: "any",
    neck: "any",
    color: "any",
    stock: "any",
  });
  const [po, setPo] = useState("");
  const [revalidation, setRevalidation] = useState<string | null>(null);

  const results = useCatalogFilter(PRODUCTS, filters);
  const draftTotal = draft.reduce((sum, l) => sum + l.cases * l.eachPerCase * l.unitPrice, 0);

  const review = async () => {
    const res = await services.erp.revalidateCart(
      account.id,
      draft.map((l) => ({ productId: l.productId, cases: l.cases })),
    );
    setRevalidation(res.data.message);
  };

  const submit = () => {
    const order = placeDraftOrder(po);
    setRevalidation(null);
    setPo("");
    if (order)
      toast.success(`Demo order ${order.id} created`, {
        description: "Stored locally only. No order was written to any system.",
      });
  };

  return (
    <PortalShell
      account={account}
      title="Private catalog"
      intro={
        <p className="measure text-sm text-muted-foreground">
          Your price sits beside the public list price. Quantity breaks, case counts, and
          available-to-sell reflect the demo data set as of {account.asOf}.
        </p>
      }
      rail={
        <div className="lg:sticky lg:top-[73px]">
          <h2 className="label-caps text-muted-foreground">Demo order draft</h2>
          {draft.length === 0 ? (
            <p className="spec-note mt-3">
              Nothing added. Stocked items can be added directly; custom programs route to a quote.
            </p>
          ) : (
            <>
              <ul className="mt-3 divide-y divide-border border-y border-border">
                {draft.map((line) => (
                  <li key={line.productId} className="py-3">
                    <p className="spec-note text-foreground">{line.code}</p>
                    <p className="text-sm font-medium">{line.name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Label
                        htmlFor={`cases-${line.productId}`}
                        className="label-caps text-muted-foreground"
                      >
                        Cases
                      </Label>
                      <Input
                        id={`cases-${line.productId}`}
                        type="number"
                        min={1}
                        value={line.cases}
                        onChange={(e) => updateDraft(line.productId, Number(e.target.value) || 1)}
                        className="tabular h-8 w-20 rounded-sm"
                      />
                      <span className="spec-note ml-auto">
                        {money(line.cases * line.eachPerCase * line.unitPrice)}
                      </span>
                      <button
                        onClick={() => removeDraft(line.productId)}
                        aria-label={`Remove ${line.code}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="tabular mt-3 flex items-baseline justify-between">
                <span className="label-caps text-muted-foreground">Draft total</span>
                <span className="font-display text-lg font-semibold">{money(draftTotal)}</span>
              </p>
              <DemoTag tone="illustrative" className="mt-2" />

              <div className="mt-4 space-y-2">
                <Label htmlFor="po" className="label-caps text-muted-foreground">
                  Your PO number
                </Label>
                <Input
                  id="po"
                  value={po}
                  onChange={(e) => setPo(e.target.value)}
                  placeholder="ML-PO-88240"
                  className="rounded-sm"
                />
                <Button variant="outline" className="w-full" onClick={review}>
                  Review & revalidate
                </Button>
                {revalidation && (
                  <p className="border border-border bg-secondary p-3 text-sm text-muted-foreground">
                    {revalidation}
                  </p>
                )}
                <Button variant="accent" className="w-full" onClick={submit}>
                  Submit demo order
                </Button>
                <Button variant="rail" className="w-full" onClick={clearDraft}>
                  Clear draft
                </Button>
              </div>
            </>
          )}
        </div>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <CatalogFilters filters={filters} onChange={setFilters} products={PRODUCTS} />
        <div className="min-w-0">
          <p className="spec-note border-b border-border pb-3">
            {results.length} items · UOM CASE · prices per item
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {results.map((product) => (
              <div key={product.id}>
                <ProductCard
                  product={product}
                  view="list"
                  mode="portal"
                  action={
                    product.demoUnitPrice === null ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast.info("Quote request (prototype)", {
                            description: `${product.code} is a custom program and would route to a quote.`,
                          })
                        }
                      >
                        Request quote
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          addDraftLine({
                            productId: product.id,
                            code: product.code,
                            name: product.name,
                            unitPrice: product.demoUnitPrice!,
                            eachPerCase: product.caseCount,
                          });
                          toast.success("Added to demo order", { description: product.code });
                        }}
                      >
                        Add case to order
                      </Button>
                    )
                  }
                />
                {(product.quantityBreaks || product.warehouses) && (
                  <div className="grid gap-4 border-x border-b border-border bg-secondary p-3 sm:grid-cols-2">
                    {product.quantityBreaks && (
                      <div>
                        <p className="label-caps text-muted-foreground">Quantity breaks</p>
                        <ul className="spec-note mt-1 space-y-0.5">
                          {product.quantityBreaks.map((b) => (
                            <li key={b.minCases}>
                              {b.minCases}+ cases — {money(b.unitPrice, 3)} / item
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <p className="label-caps text-muted-foreground">Available to sell</p>
                      <p className="spec-note mt-1">
                        {(product.availableToSell ?? 0).toLocaleString()} ea ·{" "}
                        {product.warehouses?.map((w) => `${w.code} ${w.qty.toLocaleString()}`).join(" · ") ||
                          "No stocking warehouse"}
                      </p>
                      <p className="spec-note">As of {account.asOf}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
