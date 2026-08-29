import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowDownRight, ArrowUpRight, Download, Minus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { PortalShell } from "@/components/portal/PortalShell";
import { DemoTag } from "@/components/site/DemoTag";
import { useDemo } from "@/lib/demo-store";
import { ACCOUNT, PRICE_BOOK, getAccount, type PriceBookRow } from "@/data/portal";
import { money } from "@/data/products";

export const Route = createFileRoute("/portal/price-book")({
  component: PriceBook,
});

function Change({ prior, current }: { prior: number; current: number }) {
  if (current === prior)
    return (
      <span className="label-caps flex items-center gap-1 text-muted-foreground">
        <Minus className="size-3" aria-hidden="true" /> No change
      </span>
    );
  const down = current < prior;
  const pct = (((current - prior) / prior) * 100).toFixed(1);
  return (
    <span className={`label-caps flex items-center gap-1 ${down ? "text-primary" : "text-accent"}`}>
      {down ? (
        <ArrowDownRight className="size-3" aria-hidden="true" />
      ) : (
        <ArrowUpRight className="size-3" aria-hidden="true" />
      )}
      {down ? "" : "+"}
      {pct}%
    </span>
  );
}

function PriceBook() {
  const { accountId } = useDemo();
  const account = getAccount(accountId) ?? ACCOUNT;
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<PriceBookRow | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return PRICE_BOOK.filter(
      (r) => !term || `${r.sku} ${r.description} ${r.basis}`.toLowerCase().includes(term),
    );
  }, [q]);

  return (
    <PortalShell
      account={account}
      title="Price book"
      intro={
        <div className="measure space-y-2 text-sm text-muted-foreground">
          <p>
            Pricing for {account.name} (class {account.priceClass}). Rows are labeled by basis:
            public list price, price-class pricing, or a customer-specific override.
          </p>
          <p className="label-caps text-foreground">Acumatica will remain the source of truth.</p>
        </div>
      }
      rail={
        <div>
          <h2 className="label-caps text-muted-foreground">Tools</h2>
          <div className="mt-3 flex flex-col gap-2">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() =>
                toast.info("Simulated CSV download", {
                  description: `price-book-${account.id}.csv would download here.`,
                })
              }
            >
              <Download className="size-4" /> Download CSV (simulated)
            </Button>
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="label-caps text-muted-foreground">Public list price</dt>
              <dd className="text-muted-foreground">Published rate available to any buyer.</dd>
            </div>
            <div>
              <dt className="label-caps text-muted-foreground">Price class {account.priceClass}</dt>
              <dd className="text-muted-foreground">Applies to every distributor in this class.</dd>
            </div>
            <div>
              <dt className="label-caps text-muted-foreground">Customer override</dt>
              <dd className="text-muted-foreground">Negotiated for {account.name} specifically.</dd>
            </div>
          </dl>
        </div>
      }
    >
      <div data-demo-target="price-book">
        <div className="flex flex-wrap items-center gap-3 pb-4">
          <div className="flex min-w-56 flex-1 items-center gap-2 border border-input bg-card px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="pb-search" className="sr-only">
              Search price book
            </label>
            <Input
              id="pb-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="SKU, description, or basis…"
              className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <p className="spec-note">{rows.length} SKUs</p>
          <DemoTag tone="illustrative" />
        </div>

        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <caption className="sr-only">Price book for {account.name}</caption>
            <thead>
              <tr className="border-b border-border bg-secondary text-left">
                {[
                  "SKU",
                  "Description",
                  "UOM",
                  "Min qty",
                  "Prior",
                  "Current",
                  "Effective",
                  "Basis",
                  "Change",
                  "",
                ].map((h) => (
                  <th key={h} scope="col" className="label-caps px-3 py-2.5 text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.sku}
                  className="border-b border-border last:border-0 hover:bg-secondary"
                >
                  <th scope="row" className="spec-note px-3 py-3 text-left text-foreground">
                    {row.sku}
                  </th>
                  <td className="px-3 py-3">{row.description}</td>
                  <td className="spec-note px-3 py-3">{row.uom}</td>
                  <td className="tabular px-3 py-3">{row.minQty}</td>
                  <td className="tabular px-3 py-3 text-muted-foreground">
                    {money(row.priorPrice, 3)}
                  </td>
                  <td className="tabular px-3 py-3 font-semibold">{money(row.currentPrice, 3)}</td>
                  <td className="spec-note px-3 py-3">{row.effective}</td>
                  <td className="px-3 py-3">
                    <span className="label-caps text-muted-foreground">{row.basis}</span>
                  </td>
                  <td className="px-3 py-3">
                    <Change prior={row.priorPrice} current={row.currentPrice} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={() => setDetail(row)}
                      className="label-caps text-primary hover:underline"
                    >
                      History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="border-x border-b border-border p-6 text-sm text-muted-foreground">
            No SKUs match “{q}”.
          </p>
        )}
        <p className="spec-note mt-3">
          Effective September 1, 2026 update included. Prices are per item; UOM is CASE.
        </p>
      </div>

      <Sheet open={Boolean(detail)} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {detail && (
            <>
              <SheetTitle className="font-display text-xl">{detail.sku}</SheetTitle>
              <p className="spec-note mt-1">{detail.description}</p>
              <h3 className="label-caps mt-6 text-muted-foreground">Price history</h3>
              <ul className="mt-2 divide-y divide-border border-y border-border">
                {detail.history.map((h) => (
                  <li key={h.effective} className="flex items-baseline gap-3 py-3">
                    <span className="spec-note w-24">{h.effective}</span>
                    <span className="tabular text-sm font-medium">{money(h.price, 3)}</span>
                    <span className="label-caps ml-auto text-muted-foreground">{h.basis}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                In production, history is read from Acumatica sales price records. Overrides are
                maintained there, not in this portal.
              </p>
              <p className="mt-3">
                <DemoTag tone="illustrative" />
              </p>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PortalShell>
  );
}
