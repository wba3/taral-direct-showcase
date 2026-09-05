import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { PortalShell } from "@/components/portal/PortalShell";
import { DemoTag } from "@/components/site/DemoTag";
import { usePortalView, orderProgress } from "@/lib/portal-view";
import { ORDER_TIMELINE, orderTotal, type DemoOrder, type OrderStatus } from "@/data/portal";
import { money } from "@/data/products";

export const Route = createFileRoute("/portal/orders")({
  validateSearch: (search: Record<string, unknown>): { order?: string | undefined } => ({
    order: typeof search["order"] === "string" ? (search["order"] as string) : undefined,
  }),
  component: Orders,
});

function Timeline({ status }: { status: OrderStatus }) {
  const current = ORDER_TIMELINE.indexOf(status);
  return (
    <ol className="mt-3 space-y-0">
      {ORDER_TIMELINE.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="flex gap-3">
            <span className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={`mt-1 size-2.5 rounded-full border ${
                  done ? "border-accent bg-accent" : "border-border bg-card"
                }`}
              />
              {i < ORDER_TIMELINE.length - 1 && (
                <span aria-hidden="true" className="h-8 w-px bg-border" />
              )}
            </span>
            <span className={`text-sm ${done ? "font-medium" : "text-muted-foreground"}`}>
              {step}
              {i === current && <span className="label-caps ml-2 text-accent">Current</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Orders() {
  const { account, orders, reorder, todayLabel } = usePortalView();
  const { order: selectedId } = Route.useSearch();
  const navigate = useNavigate();
  const selected = orders.find((o) => o.id === selectedId) ?? null;

  const open = (id: string | undefined) =>
    navigate({ to: "/portal/orders", search: id ? { order: id } : {} });

  const runReorder = (order: DemoOrder) => {
    const res = reorder(order);
    open(undefined);
    if (res.unpriced > 0) {
      toast.warning(`Reordered ${order.id} — ${res.unpriced} line(s) need a quote`, {
        description:
          "Lines without a current price for this account are held in the draft until customer service quotes them.",
      });
    } else {
      toast.success(`Reordered ${order.id}`, {
        description: `Priced at today's contract price for the final quantity (${res.added} new line(s), ${res.merged} merged).`,
      });
    }
    navigate({ to: "/portal/catalog" });
  };

  if (!account) {
    return (
      <PortalShell account={null} title="Orders">
        <p className="text-sm text-muted-foreground">
          Choose a demo account in Demo controls to see orders.
        </p>
      </PortalShell>
    );
  }

  return (
    <PortalShell
      account={account}
      title="Orders"
      intro={
        <p className="measure text-sm text-muted-foreground">
          Orders for {account.name} only, as of {todayLabel}. Requested, shipped and remaining cases
          come from the demo records; in production they come from Acumatica and the carrier.
        </p>
      }
    >
      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[880px] border-collapse text-sm">
          <caption className="sr-only">Demo orders for {account.name}</caption>
          <thead>
            <tr className="border-b border-border bg-secondary text-left">
              {["Order", "PO number", "Date", "Status", "Cases (shipped / requested)", "Shipment", "Total", ""].map(
                (h) => (
                  <th key={h} scope="col" className="label-caps px-3 py-2.5 text-muted-foreground">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const p = orderProgress(order);
              return (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary">
                  <th scope="row" className="spec-note px-3 py-3 text-left text-foreground">
                    {order.id}
                  </th>
                  <td className="px-3 py-3">{order.po}</td>
                  <td className="spec-note px-3 py-3">{order.date}</td>
                  <td className="px-3 py-3">
                    <span className="label-caps text-accent">{order.status}</span>
                  </td>
                  <td className="tabular px-3 py-3">
                    {p.shipped} / {p.requested}
                    {p.remaining > 0 && p.shipped > 0 && (
                      <span className="label-caps ml-2 text-primary">{p.remaining} remaining</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{order.shipment}</td>
                  <td className="tabular px-3 py-3">{money(orderTotal(order), 2)}</td>
                  <td className="px-3 py-3 text-right">
                    <button onClick={() => open(order.id)} className="label-caps text-primary hover:underline">
                      Detail
                    </button>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No orders yet for this account.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3">
        <DemoTag>Demo data · illustrative totals</DemoTag>
      </p>

      <Sheet open={Boolean(selected)} onOpenChange={(o) => !o && open(undefined)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetTitle className="font-display text-xl">Order {selected.id}</SheetTitle>
              <p className="spec-note mt-1">
                PO {selected.po} · {selected.date} · {account.name}
              </p>

              <h3 className="label-caps mt-6 text-muted-foreground">Status</h3>
              <Timeline status={selected.status} />
              <p className="spec-note mt-3">
                {selected.shipment} · Tracking: {selected.tracking ?? "not yet assigned"}
              </p>
              {(() => {
                const p = orderProgress(selected);
                return (
                  <p className="tabular mt-2 text-sm">
                    {p.shipped} of {p.requested} cases shipped
                    {p.remaining > 0 ? ` · ${p.remaining} remaining` : " · complete"}
                  </p>
                );
              })()}

              <h3 className="label-caps mt-6 text-muted-foreground">Line items</h3>
              <ul className="mt-2 divide-y divide-border border-y border-border">
                {selected.lines.map((line) => (
                  <li key={line.code} className="py-3">
                    <p className="spec-note text-foreground">{line.code}</p>
                    <p className="text-sm font-medium">{line.description}</p>
                    <p className="spec-note mt-1">
                      {line.casesShipped} of {line.cases} cases shipped ·{" "}
                      {line.eachPerCase.toLocaleString()} ea per case · {money(line.unitPrice, 3)} /
                      item · {money(line.cases * line.eachPerCase * line.unitPrice, 2)}
                    </p>
                    <p className="label-caps mt-1 text-accent">{line.lineStatus}</p>
                  </li>
                ))}
              </ul>
              <p className="tabular mt-3 flex items-baseline justify-between">
                <span className="label-caps text-muted-foreground">Order total</span>
                <span className="font-display text-lg font-semibold">
                  {money(orderTotal(selected), 2)}
                </span>
              </p>

              <Button className="mt-6 w-full" onClick={() => runReorder(selected)}>
                <RotateCcw className="size-4" /> Reorder at current prices
              </Button>
              <p className="spec-note mt-2">
                Reorder never reuses the historical price: each line is re-priced at its final
                quantity against today's demo price book, then reviewed before submission.
              </p>
              <p className="mt-3">
                <DemoTag>Demo data</DemoTag>
              </p>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PortalShell>
  );
}
