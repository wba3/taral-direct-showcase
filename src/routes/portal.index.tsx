import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertTriangle, Download, FileText, Info, PackageSearch, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/PortalShell";
import { DemoTag } from "@/components/site/DemoTag";
import { useDemo } from "@/lib/demo-store";
import { ACCOUNT, getAccount } from "@/data/portal";
import { money } from "@/data/products";

export const Route = createFileRoute("/portal/")({
  component: Overview,
});

function Overview() {
  const { accountId, orders, reorder } = useDemo();
  const navigate = useNavigate();
  const account = getAccount(accountId) ?? ACCOUNT;
  const lastOrder = orders[orders.length - 1];

  const metrics = [
    { label: "Open orders", value: String(account.openOrders), to: "/portal/orders" as const },
    {
      label: "Open invoices",
      value: money(account.openInvoiceTotal, 0),
      to: "/portal/invoices" as const,
    },
    { label: "Next payment due", value: account.nextPaymentDue, to: "/portal/invoices" as const },
  ];

  return (
    <PortalShell
      account={account}
      title="Overview"
      rail={
        <div>
          <h2 className="label-caps text-muted-foreground">Fast actions</h2>
          <div className="mt-3 flex flex-col gap-2">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                if (!lastOrder) return;
                reorder(lastOrder);
                toast.success(`Reordered ${lastOrder.id}`, {
                  description: "Lines added to your demo order draft.",
                });
                navigate({ to: "/portal/catalog" });
              }}
            >
              <RotateCcw className="size-4" /> Reorder last order
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/portal/catalog">
                <PackageSearch className="size-4" /> Browse private catalog
              </Link>
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() =>
                toast.info("Simulated download", {
                  description: "A CSV of your price book would download here.",
                })
              }
            >
              <Download className="size-4" /> Download price book
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/portal/invoices">
                <FileText className="size-4" /> View invoices
              </Link>
            </Button>
          </div>
          <p className="spec-note mt-6">
            Data as of {account.asOf}. In production this timestamp reflects the last successful
            Acumatica read.
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
              {alert.tone === "action" ? (
                <Link
                  to="/portal/orders"
                  className="label-caps ml-auto shrink-0 text-primary hover:underline"
                >
                  Review
                </Link>
              ) : (
                <Link
                  to="/portal/price-book"
                  className="label-caps ml-auto shrink-0 text-primary hover:underline"
                >
                  Price book
                </Link>
              )}
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
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {orders.slice(0, 3).map((order) => (
            <li key={order.id} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-3">
              <span className="spec-note text-foreground">{order.id}</span>
              <span className="text-sm">PO {order.po}</span>
              <span className="spec-note">{order.date}</span>
              <span className="label-caps text-accent">{order.status}</span>
              <Link
                to="/portal/orders"
                search={{ order: order.id }}
                className="label-caps ml-auto text-primary hover:underline"
              >
                Detail
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PortalShell>
  );
}
