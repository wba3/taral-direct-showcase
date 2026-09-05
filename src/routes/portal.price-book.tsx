import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowDownRight, ArrowUpRight, Download, Minus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { PortalShell } from "@/components/portal/PortalShell";
import { DemoTag } from "@/components/site/DemoTag";
import { usePortalView, availabilityFor, downloadTextFile, toCsv } from "@/lib/portal-view";
import { DEMO_TODAY_LABEL, type PriceBookRow } from "@/data/portal";
import { money } from "@/data/products";

export const Route = createFileRoute("/portal/price-book")({
  component: PriceBook,
});

function Change({ from, to }: { from: number; to: number }) {
  if (to === from)
    return (
      <span className="label-caps flex items-center gap-1 text-muted-foreground">
        <Minus className="size-3" aria-hidden="true" /> No change
      </span>
    );
  const down = to < from;
  const pct = (((to - from) / from) * 100).toFixed(1);
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
  const { account, priceRows, simulateStaleInventory, simulatePriceUpdate, asOf } = usePortalView();
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<PriceBookRow | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return priceRows.filter(
      (r) => !term || `${r.sku} ${r.description} ${r.basis}`.toLowerCase().includes(term),
    );
  }, [priceRows, q]);

  if (!account) return null;

  const exportCsv = () => {
    const csv = toCsv([
      ["DEMO DATA — Taral Direct prototype. Not a Taral Plastics price list."],
      [`Account ${account.id} · ${account.name}`, `Price class ${account.priceClass}`],
      [`Demo business date ${DEMO_TODAY_LABEL}`, `Snapshot ${asOf}`],
      [],
      [
        "SKU",
        "Description",
        "UOM",
        "Min cases",
        "Currency",
        "Current price",
        "Effective",
        "Upcoming price",
        "Upcoming effective",
        "Basis",
      ],
      ...rows.map((r) => [
        r.sku,
        r.description,
        r.uom,
        r.minCases,
        r.currency,
        r.currentPrice.toFixed(3),
        r.effective,
        r.upcomingPrice != null ? r.upcomingPrice.toFixed(3) : "",
        r.upcomingEffective ?? "",
        r.basis,
      ]),
    ]);
    downloadTextFile(`demo-price-book-${account.id}.csv`, csv);
    toast.success("CSV downloaded", {
      description: `${rows.length} row(s) scoped to account ${account.id}, marked as demo data.`,
    });
  };

  return (
    <PortalShell
      account={account}
      title="Price book"
      intro={
        <div className="measure space-y-2 text-sm text-muted-foreground">
          <p>
            Pricing for {account.name} (class {account.priceClass}). Each row shows the basis for the
            price — published list, your price class, or a negotiated override — with the quantity
            break it applies from.
          </p>
          <p className="label-caps text-foreground">
            Announced changes take effect on their date, not before.
          </p>
        </div>
      }
      rail={
        <div>
          <h2 className="label-caps text-muted-foreground">Tools</h2>
          <div className="mt-3 flex flex-col gap-2">
            <Button variant="outline" className="justify-start" onClick={exportCsv}>
              <Download className="size-4" /> Download CSV
            </Button>
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="label-caps text-muted-foreground">Public list</dt>
              <dd className="text-muted-foreground">Published rate available to any buyer.</dd>
            </div>
            <div>
              <dt className="label-caps text-muted-foreground">Price class {account.priceClass}</dt>
              <dd className="text-muted-foreground">Applies to every account in this class.</dd>
            </div>
            <div>
              <dt className="label-caps text-muted-foreground">Customer override</dt>
              <dd className="text-muted-foreground">Negotiated for {account.name} specifically.</dd>
            </div>
          </dl>
          <p className="spec-note mt-6">
            Availability snapshot {asOf}
            {simulateStaleInventory ? " · stale snapshot simulated" : ""}
          </p>
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
          <p className="spec-note tabular">{rows.length} rows</p>
          <DemoTag tone="illustrative" />
        </div>

        {simulatePriceUpdate && (
          <p className="mb-4 border-l-2 border-accent bg-secondary p-3 text-sm">
            Price update simulation is on: announced prices are being shown as if their effective
            date had arrived. <DemoTag tone="illustrative">Simulated</DemoTag>
          </p>
        )}

        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <caption className="sr-only">Price book for {account.name}</caption>
            <thead>
              <tr className="border-b border-border bg-secondary text-left">
                {[
                  "SKU",
                  "Description",
                  "UOM",
                  "Min cases",
                  "Cur.",
                  "Current price",
                  "Effective",
                  "Upcoming",
                  "Availability",
                  "Basis",
                  "",
                ].map((h) => (
                  <th key={h} scope="col" className="label-caps px-3 py-2.5 text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const avail = availabilityFor(row.productId, simulateStaleInventory);
                return (
                  <tr
                    key={`${row.sku}-${row.minCases}`}
                    className="border-b border-border last:border-0 hover:bg-secondary"
                  >
                    <th scope="row" className="spec-note px-3 py-3 text-left text-foreground">
                      {row.sku}
                    </th>
                    <td className="px-3 py-3">{row.description}</td>
                    <td className="spec-note px-3 py-3">{row.uom}</td>
                    <td className="tabular px-3 py-3">{row.minCases}</td>
                    <td className="spec-note px-3 py-3">{row.currency}</td>
                    <td className="tabular px-3 py-3 font-semibold">
                      {money(row.currentPrice, 3)}
                    </td>
                    <td className="spec-note px-3 py-3">{row.effective}</td>
                    <td className="px-3 py-3">
                      {row.upcomingPrice != null && row.upcomingEffective ? (
                        <span className="block">
                          <span className="tabular text-sm">{money(row.upcomingPrice, 3)}</span>
                          <span className="spec-note block">from {row.upcomingEffective}</span>
                          <Change from={row.currentPrice} to={row.upcomingPrice} />
                        </span>
                      ) : (
                        <span className="spec-note">No change announced</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {avail ? (
                        <span className="block">
                          <span className="tabular text-sm">
                            {avail.state === "Unavailable"
                              ? "Unavailable"
                              : `${avail.availableCases} cases`}
                          </span>
                          <span
                            className={`spec-note block ${
                              avail.state === "Fresh" ? "" : "text-accent"
                            }`}
                          >
                            {avail.state === "Fresh" ? avail.warehouse : avail.state}
                          </span>
                        </span>
                      ) : (
                        <span className="spec-note">Request details</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="label-caps text-muted-foreground">{row.basis}</span>
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
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="border-x border-b border-border p-6 text-sm text-muted-foreground">
            No rows match “{q}”.
          </p>
        )}
        <p className="spec-note mt-3">
          Prices are per item; the unit of measure is a whole case. Demo business date{" "}
          {DEMO_TODAY_LABEL}.
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
                  <li key={`${h.effective}-${h.price}`} className="flex items-baseline gap-3 py-3">
                    <span className="spec-note w-24">{h.effective}</span>
                    <span className="tabular text-sm font-medium">{money(h.price, 3)}</span>
                    <span className="label-caps ml-auto text-muted-foreground">{h.basis}</span>
                  </li>
                ))}
              </ul>
              {detail.upcomingPrice != null && detail.upcomingEffective && (
                <p className="mt-4 border-l-2 border-accent pl-3 text-sm">
                  {money(detail.upcomingPrice, 3)} takes effect {detail.upcomingEffective}. Orders
                  placed before that date use {money(detail.currentPrice, 3)}.
                </p>
              )}
              <p className="mt-4 text-sm text-muted-foreground">
                Taral's business system holds the authoritative price records; overrides are
                maintained there rather than in this account service.
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
