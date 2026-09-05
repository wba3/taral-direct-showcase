import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoTag } from "@/components/site/DemoTag";
import { useDemo } from "@/lib/demo-store";
import { ACCOUNTS, DEMO_ROLES, DEMO_TODAY_LABEL } from "@/data/portal";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Account access — pricing, orders and invoices | Taral Direct" },
      {
        name: "description",
        content:
          "Taral Direct account service: your contract pricing, order status, invoices and payment terms in one place. Prototype with demo transactions.",
      },
      { property: "og:title", content: "Taral Direct account access" },
      {
        property: "og:description",
        content: "Your contract pricing, order status, invoices and payment terms in one place.",
      },
    ],
  }),
  component: PortalGate,
});

function PortalGate() {
  const { role, setRole, hydrated } = useDemo();
  const navigate = useNavigate();

  if (!hydrated) {
    return <div className="mx-auto max-w-[1400px] px-4 py-16" aria-busy="true" />;
  }

  if (!role) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_460px]">
          <div>
            <p className="label-caps text-muted-foreground">Taral Direct · account service</p>
            <h1 className="mt-3 max-w-[24ch] font-display text-4xl font-bold tracking-tight">
              Your prices, your orders, your balance — without a phone call.
            </h1>
            <p className="measure mt-4 text-muted-foreground">
              Customers and distributors sign in to see the pricing set for their account, the status
              of what they ordered, and what is owed. This prototype has no sign-in: choose one of
              the demo people below to see the experience from their side.
            </p>
            <ul className="mt-8 divide-y divide-border border-y border-border">
              {[
                ["Your price book", "Contract pricing, quantity breaks and announced changes"],
                ["Availability", "Available-to-sell with the time the snapshot was taken"],
                ["Orders", "Requested, shipped and remaining, line by line"],
                ["Invoices", "Outstanding balance, terms and early-payment deadlines"],
              ].map(([label, text]) => (
                <li key={label} className="flex flex-wrap gap-x-6 gap-y-1 py-3">
                  <span className="label-caps w-44 text-muted-foreground">{label}</span>
                  <span className="text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel h-fit p-6" data-demo-target="portal-entry">
            <p className="label-caps flex items-center gap-2 text-primary">
              <ShieldCheck className="size-4" aria-hidden="true" /> Demo access
            </p>
            <h2 className="mt-3 font-display text-xl font-semibold">Who are you today?</h2>
            <p className="spec-note mt-2">Demo business date {DEMO_TODAY_LABEL}</p>
            <ul className="mt-5 space-y-3">
              {DEMO_ROLES.map((r) => {
                const account = r.accountId ? ACCOUNTS[r.accountId] : null;
                return (
                  <li key={r.id} className="border border-border p-4">
                    <p className="label-caps text-muted-foreground">{r.label}</p>
                    <p className="mt-1 font-display text-base font-semibold">{r.person}</p>
                    <p className="spec-note mt-1">
                      {account ? `${account.name} · Account ${account.id}` : "Taral Plastics staff"}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{r.summary}</p>
                    <Button
                      className="mt-3 w-full"
                      onClick={() => {
                        setRole(r.id);
                        navigate({ to: r.accountId ? "/portal" : "/portal/operations" });
                      }}
                    >
                      Continue as {r.person.split(" ")[0]}
                    </Button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 space-x-2">
              <DemoTag>Demo data</DemoTag>
              <DemoTag tone="neutral">Demo role · not a sign-in</DemoTag>
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Role selection in this prototype is a presentation device only. Real accounts would
              require genuine sign-in with access enforced on the server.
            </p>
            <p className="mt-4">
              <Link to="/contact" className="label-caps text-primary hover:underline">
                Ask about opening an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
