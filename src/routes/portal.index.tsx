import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertTriangle, FileText, Info, PackageSearch, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/PortalShell";
import { DemoTag } from "@/components/site/DemoTag";
import { usePortalView, orderProgress } from "@/lib/portal-view";
import { money } from "@/data/products";

export const Route = createFileRoute("/portal/")({
  component: Overview,
});

function Overview() {
  const { account, orders, reorder, invoices, totals, asOf, role } = usePortalView();
  const navigate = useNavigate();
  const lastOrder = orders[0];

  if (!account) return null;

  const metrics = [
    {
      label: "Open orders",
      value: String(totals.openOrders),
      note: `${money(totals.openOrderValue, 0)} in open order value`,
      to: "/portal/orders" as const,
    },
    {
      label: "Outstanding balance",
      value: money(totals.outstanding, 0),
      note:
        totals.pending > 0
          ? `${money(totals.pending, 0)} received, posting pending`
          : `${invoices.filter((v) => v.outstanding > 0).length} invoice(s) open`,
      to: "/portal/invoices" as const,
    },
    {
      label: "Next payment due",
      value: totals.nextDue ?? "Nothing due",
      note: totals.overdue > 0 ? `${money(totals.overdue, 0)} past due` : "No past-due balance",
      to: "/portal/invoices" as const,
    },
  ];

  return (
    <PortalShell
      account={account}
      title="Overview"
      rail={
        <div>
          <h2 className="label-caps text-muted-foreground">Fast actions</h2>
          <div className="mt-3 flex flex-col gap-2">
            {role === "buyer" && (
              <>
                <Button
                  variant="outline"
                  className="justify-start"
                  disabled={!lastOrder}
                  onClick={() => {
                    if (!lastOrder) return;
                    const result = reorder(lastOrder);
                    toast.success(`Reordered ${lastOrder.id}`, {
                      description: `${result.added} line(s) added${
                        result.merged > 0
                          ? `, ${result.merged} merged and repriced at today's contract price`
                          : ""
                      }.`,
                    });
                    navigate({ to: "/portal/catalog" });
                  }}
                >
                  <RotateCcw className="size-4" /> Reorder {lastOrder?.id ?? "last order"}
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/portal/catalog">
                    <PackageSearch className="size-4" /> Place an order
                  </Link>
                </Button>
              </>
            )}
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/portal/invoices">
                <FileText className="size-4" /> View invoices
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/portal/price-book">Your price book</Link>
            </Button>
          </div>
          <p className="spec-note mt-6">
            Data as of {asOf}. In the live service this timestamp is the last successful read from
            Taral's business system.
          </p>
        </div>
      }
    >
      <div data-demo-target="portal-entry">
        <dl className="grid gap-px bg-border sm:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label} className="bg-card p-5">
              <dt className="label-caps text-muted-foreground">{m.label}</dt>
              <dd className="tabular mt-2 font-display text-2xl font-bold">{m.value}</dd>
              <p className="spec-note mt-1">{m.note}</p>
              <div className="mt-3 flex items-center gap-2">
                <DemoTag>Demo data</DemoTag>
                <Link to={m.to} className="label-caps text-primary hover:underline">
                  Open
                </Link>
              </div>
            </div>
          ))}
        </dl>
      </div>

      <section aria-labelledby="alerts-heading" className="mt-8">
        <h2 id="alerts-heading" className="label-caps text-muted-foreground">
          Alerts
        </h2>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {account.alerts.map((alert) => (
            <li key={alert.text} className="flex items-start gap-3 py-3">
              {alert.tone === "action" ? (
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              ) : (
                <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              )}
              <p className="text-sm">
                {alert.text} <DemoTag className="ml-1" />
              </p>
              <Link
                to={alert.tone === "action" ? "/portal/orders" : "/portal/price-book"}
                className="label-caps ml-auto shrink-0 text-primary hover:underline"
              >
                {alert.tone === "action" ? "Review" : "Price book"}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-heading" className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 id="recent-heading" className="label-caps text-muted-foreground">
            Recent orders
          </h2>
          <Link to="/portal/orders" className="label-caps text-primary hover:underline">
            All orders
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-3 border-y border-border py-6 text-sm text-muted-foreground">
            No orders on this account yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {orders.slice(0, 3).map((order) => {
              const p = orderProgress(order);
              return (
                <li key={order.id} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-3">
                  <span className="spec-note text-foreground">{order.id}</span>
                  <span className="text-sm">PO {order.po}</span>
                  <span className="spec-note">{order.date}</span>
                  <span className="label-caps text-accent">{order.status}</span>
                  <span className="spec-note tabular">
                    {p.shipped} of {p.requested} cases shipped
                  </span>
                  <Link
                    to="/portal/orders"
                    search={{ order: order.id }}
                    className="label-caps ml-auto text-primary hover:underline"
                  >
                    Detail
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </PortalShell>
  );
}
