import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoTag } from "@/components/site/DemoTag";
import { useDemo } from "@/lib/demo-store";
import { ACCOUNT } from "@/data/portal";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Distributor portal (demo) — pricing, orders, invoices | Taral Direct" },
      {
        name: "description",
        content:
          "Prototype distributor self-service: private price book, available-to-sell, order status, invoices, and a demo payment path. Demo data only.",
      },
      { property: "og:title", content: "Taral Direct distributor portal — prototype" },
      {
        property: "og:description",
        content:
          "Enter as a demo distributor account to see private pricing, orders, invoices, and payment flows.",
      },
    ],
  }),
  component: PortalGate,
});

function PortalGate() {
  const { accountId, enterDemo, hydrated } = useDemo();

  if (!hydrated) {
    return <div className="mx-auto max-w-[1400px] px-4 py-16" aria-busy="true" />;
  }

  // Inline demo entry stands in for authentication. No credentials, no session.
  if (!accountId) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="label-caps text-muted-foreground">Distributor sign in</p>
            <h1 className="mt-3 max-w-[24ch] font-display text-4xl font-bold tracking-tight">
              Your prices, your orders, your balance — without a phone call.
            </h1>
            <p className="measure mt-4 text-muted-foreground">
              In production, distributors would sign in with their own credentials and see only
              their own account. This prototype has no authentication at all: one control drops you
              into a single simulated account so the experience can be evaluated.
            </p>
            <ul className="mt-8 divide-y divide-border border-y border-border">
              {[
                ["Private price book", "Customer-specific pricing with effective dates"],
                ["Inventory visibility", "Available-to-sell by warehouse with an as-of timestamp"],
                ["Orders", "Status timeline from submitted through delivered"],
                ["Invoices", "Open balance, discount dates, and a payment path"],
              ].map(([label, text]) => (
                <li key={label} className="flex flex-wrap gap-x-6 gap-y-1 py-3">
                  <span className="label-caps w-44 text-muted-foreground">{label}</span>
                  <span className="text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel h-fit p-6">
            <p className="label-caps flex items-center gap-2 text-primary">
              <ShieldCheck className="size-4" aria-hidden="true" /> Demo access
            </p>
            <h2 className="mt-3 font-display text-xl font-semibold">
              {ACCOUNT.name} · Account {ACCOUNT.id}
            </h2>
            <p className="spec-note mt-2">
              Terms {ACCOUNT.terms} · Price class {ACCOUNT.priceClass}
            </p>
            <Button
              data-demo-target="portal-entry"
              className="mt-6 w-full"
              onClick={() => enterDemo(ACCOUNT.id)}
            >
              <KeyRound className="size-4" /> Enter demo as {ACCOUNT.name}
            </Button>
            <p className="mt-4 space-x-2">
              <DemoTag>Demo data</DemoTag>
              <DemoTag tone="neutral">No authentication</DemoTag>
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Only this simulated account's records exist in the prototype, so no other customer's
              data can be reached.
            </p>
            <p className="mt-4">
              <Link to="/integration" className="label-caps text-primary hover:underline">
                How real sign-in would work
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
