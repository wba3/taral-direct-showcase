import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { PortalShell } from "@/components/portal/PortalShell";
import { DemoTag } from "@/components/site/DemoTag";
import { useDemo } from "@/lib/demo-store";
import { ACCOUNT, ORDER_TIMELINE, getAccount, type DemoOrder } from "@/data/portal";
import { money } from "@/data/products";

export const Route = createFileRoute("/portal/orders")({
  validateSearch: (search: Record<string, unknown>): { order?: string } => ({
    order: typeof search["order"] === "string" ? (search["order"] as string) : undefined,
  }),
  component: Orders,
});

const orderTotal = (order: DemoOrder) =>
  order.lines.reduce((sum, l) => sum + l.cases * l.eachPerCase * l.unitPrice, 0);

function Timeline({ status }: { status: DemoOrder["status"] }) {
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
  const { accountId, orders, reorder } = useDemo();
  const account = getAccount(accountId) ?? ACCOUNT;
  const { order: selectedId } = Route.useSearch();
  const navigate = useNavigate();
  const selected = orders.find((o) => o.id === selectedId) ?? null;

  const open = (id: string | undefined) =>
    navigate({ to: "/portal/orders", search: id ? { order: id } : {} });

  return (
    <PortalShell
      account={account}
      title="Orders"
      intro={
        <p className="measure text-sm text-muted-foreground">
          Order records for {account.name} only. Statuses, shipment notes, and tracking are demo
          data; in production they come from Acumatica and the carrier.
        </p>
      }
    >
      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <caption className="sr-only">Demo orders for {account.name}</caption>
          <thead>
            <tr className="border-b border-border bg-secondary text-left">
              {["Order", "PO number", "Date", "Status", "Shipment", "Total", ""].map((h) => (
                <th key={h} scope="col" className="label-caps px-3 py-2.5 text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary">
                <th scope="row" className="spec-note px-3 py-3 text-left text-foreground">
                  {order.id}
                </th>
                <td className="px-3 py-3">{order.po}</td>
                <td className="spec-note px-3 py-3">{order.date}</td>
                <td className="px-3 py-3">
                  <span className="label-caps text-accent">{order.status}</span>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{order.shipment}</td>
                <td className="tabular px-3 py-3">{money(orderTotal(order))}</td>
                <td className="px-3 py-3 text-right">
                  <button
                    onClick={() => open(order.id)}
                    className="label-caps text-primary hover:underline"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
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

              <h3 className="label-caps mt-6 text-muted-foreground">Line items</h3>
              <ul className="mt-2 divide-y divide-border border-y border-border">
                {selected.lines.map((line) => (
                  <li key={line.code} className="py-3">
                    <p className="spec-note text-foreground">{line.code}</p>
                    <p className="text-sm font-medium">{line.description}</p>
                    <p className="spec-note mt-1">
                      {line.cases} cases × {line.eachPerCase.toLocaleString()} ea ·{" "}
                      {money(line.unitPrice, 3)} / item ·{" "}
                      {money(line.cases * line.eachPerCase * line.unitPrice)}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="tabular mt-3 flex items-baseline justify-between">
                <span className="label-caps text-muted-foreground">Order total</span>
                <span className="font-display text-lg font-semibold">
                  {money(orderTotal(selected))}
                </span>
              </p>

              <Button
                className="mt-6 w-full"
                onClick={() => {
                  reorder(selected);
                  open(undefined);
                  toast.success(`Reordered ${selected.id}`, {
                    description: "Lines added to your demo order draft in the private catalog.",
                  });
                }}
              >
                <RotateCcw className="size-4" /> Reorder these lines
              </Button>
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
