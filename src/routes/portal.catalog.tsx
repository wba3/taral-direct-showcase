import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";
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
import { resolvePrice, priceBookFor, isFuture, orderMinimumFor } from "@/data/portal";
import { newReference, wholeQty } from "@/lib/demo-store";
import { availabilityFor, usePortalView } from "@/lib/portal-view";
import { services } from "@/lib/adapters/mock";

export const Route = createFileRoute("/portal/catalog")({
  component: PrivateCatalog,
});

function PrivateCatalog() {
  const {
    account,
    accountId,
    draft,
    addDraftLine,
    updateDraft,
    removeDraft,
    clearDraft,
    placeDraftOrder,
    simulateStaleInventory,
    asOf,
  } = usePortalView();
  const [filters, setFilters] = useState<FilterState>({
    q: "",
    category: "any",
    volume: "any",
    neck: "any",
    color: "any",
    stock: "any",
  });
  const [po, setPo] = useState("");
  const [review, setReview] = useState<{ ok: boolean; message: string } | null>(null);
  const [idemKey, setIdemKey] = useState(() => newReference("IDEMP"));

  const results = useCatalogFilter(PRODUCTS, filters);
  const priced = draft.filter((l) => l.unitPrice != null);
  const draftTotal = priced.reduce(
    (sum, l) => sum + l.cases * l.eachPerCase * (l.unitPrice ?? 0),
    0,
  );
  const unpriced = draft.length - priced.length;

  if (!account) {
    return (
      <PortalShell account={null} title="Order">
        <p className="text-sm text-muted-foreground">
          Choose a demo account in Demo controls to place an order.
        </p>
      </PortalShell>
    );
  }

  const revalidate = async () => {
    const res = await services.erp.revalidateCart(
      account.id,
      draft.map((l) => ({ productId: l.productId, cases: l.cases })),
    );
    setReview({ ok: res.data.ok, message: res.data.message });
  };

  const submit = () => {
    const res = placeDraftOrder(po, idemKey);
    if (res.duplicate) {
      toast.info("Already submitted", {
        description: `This draft was already submitted as ${res.order?.id}.`,
      });
      return;
    }
    if (!res.ok || !res.order) {
      toast.error("Order not submitted", { description: res.errors.join(" ") });
      setReview({ ok: false, message: res.errors.join(" ") });
      return;
    }
    setReview(null);
    setPo("");
    setIdemKey(newReference("IDEMP"));
    toast.success(`Demo order ${res.order.id} created`, {
      description: "Saved in this browser only. No order was written to any system.",
    });
  };

  return (
    <PortalShell
      account={account}
      title="Order"
      intro={
        <p className="measure text-sm text-muted-foreground">
          Prices are specific to the selected demo account. Quantity breaks, case counts and
          availability reflect the demo data as of {asOf}. Orders are whole cases, minimum{" "}
          {account.caseMinimum} case per line. {account.smallOrderFee}.
        </p>
      }
      rail={
        <div className="lg:sticky lg:top-[73px]">
          <h2 className="label-caps text-muted-foreground">Demo order draft</h2>
          {draft.length === 0 ? (
            <p className="spec-note mt-3">
              Nothing added. Stocked items can be added directly; items without a current price for
              this account route to customer service for a quote.
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
                        min={account.caseMinimum}
                        step={1}
                        value={line.cases}
                        onChange={(e) =>
                          updateDraft(
                            line.productId,
                            wholeQty(e.target.value, account.caseMinimum, 9999),
                          )
                        }
                        className="tabular h-8 w-20 rounded-sm"
                      />
                      <span className="spec-note ml-auto">
                        {line.unitPrice == null
                          ? "Quote"
                          : money(line.cases * line.eachPerCase * line.unitPrice, 2)}
                      </span>
                      <button
                        onClick={() => removeDraft(line.productId)}
                        aria-label={`Remove ${line.code}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p className="spec-note mt-1">
                      {line.unitPrice == null
                        ? "No current price for this account — customer service will quote it."
                        : `${money(line.unitPrice, 3)} / item · ${line.priceBasis} · effective ${line.priceEffective}`}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="tabular mt-3 flex items-baseline justify-between">
                <span className="label-caps text-muted-foreground">Draft total</span>
                <span className="font-display text-lg font-semibold">{money(draftTotal, 2)}</span>
              </p>
              {unpriced > 0 && (
                <p className="spec-note text-accent">
                  {unpriced} line(s) awaiting a quote are excluded from the total and block
                  submission.
                </p>
              )}
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
                <Button variant="outline" className="w-full" onClick={revalidate}>
                  Review price &amp; availability
                </Button>
                {review && (
                  <p
                    className={`border p-3 text-sm ${
                      review.ok
                        ? "border-border bg-secondary text-muted-foreground"
                        : "border-destructive/40 bg-destructive/5"
                    }`}
                  >
                    {!review.ok && (
                      <AlertTriangle
                        className="mr-1 inline size-4 align-[-2px] text-destructive"
                        aria-hidden="true"
                      />
                    )}
                    {review.message}
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
      <div
        data-demo-target="portal-catalog"
        className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]"
      >
        <CatalogFilters filters={filters} onChange={setFilters} products={PRODUCTS} />
        <div className="min-w-0">
          <p className="spec-note border-b border-border pb-3">
            {results.length} items · UOM CASE · prices per item · as of {asOf}
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {results.map((product) => {
              const minimum = orderMinimumFor(accountId, product.id);
              const yourPrice = resolvePrice(accountId, product.id, minimum);
              const tiers = priceBookFor(accountId)
                .filter((r) => r.productId === product.id && !isFuture(r.effective))
                .sort((a, b) => a.minCases - b.minCases);
              const avail = availabilityFor(product.id, simulateStaleInventory);
              return (
                <div key={product.id}>
                  <ProductCard
                    product={product}
                    view="list"
                    mode="portal"
                    action={
                      yourPrice == null ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            addDraftLine({
                              productId: product.id,
                              code: product.code,
                              name: product.name,
                              eachPerCase: product.caseCount,
                              cases: minimum,
                              unitPrice: null,
                            });
                            toast.info("Added for quoting", {
                              description: `${product.code} has no current price for ${account.id}; customer service would quote it.`,
                            });
                          }}
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
                              eachPerCase: product.caseCount,
                              cases: minimum,
                            });
                            toast.success("Added to demo order", { description: product.code });
                          }}
                        >
                          Add to order
                        </Button>
                      )
                    }
                  />
                  <div className="grid gap-4 border-x border-b border-border bg-secondary p-3 sm:grid-cols-3">
                    <div>
                      <p className="label-caps text-muted-foreground">Your price</p>
                      <p className="tabular mt-1 text-sm">
                        {yourPrice
                          ? `${money(yourPrice.currentPrice, 3)} / item · ${yourPrice.basis}`
                          : "Request quote"}
                      </p>
                      {yourPrice && <p className="spec-note">Effective {yourPrice.effective}</p>}
                    </div>
                    <div>
                      <p className="label-caps text-muted-foreground">Quantity breaks</p>
                      {tiers.length ? (
                        <ul className="spec-note mt-1 space-y-0.5">
                          {tiers.map((b) => (
                            <li key={b.minCases}>
                              {b.minCases}+ cases — {money(b.currentPrice, 3)} / item
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="spec-note mt-1">No current account price</p>
                      )}
                    </div>
                    <div>
                      <p className="label-caps text-muted-foreground">Availability</p>
                      {avail ? (
                        <>
                          <p className="spec-note mt-1">
                            {avail.state === "Unavailable"
                              ? "Unavailable — not currently stocked"
                              : `${avail.availableCases.toLocaleString()} cases · ${avail.warehouse}`}
                          </p>
                          <p className="spec-note">As of {avail.asOf}</p>
                          {avail.state === "Stale" && (
                            <p className="label-caps mt-1 text-accent">
                              Stale snapshot — confirm before committing
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="spec-note mt-1">
                          Not tracked in the demo data — request details
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
