import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoTag } from "@/components/site/DemoTag";

export const Route = createFileRoute("/integration")({
  head: () => ({
    meta: [
      { title: "Integration blueprint — how Taral Direct would connect | Taral Direct" },
      {
        name: "description",
        content:
          "Plain-language plan for connecting a modern Taral Plastics web experience to Acumatica as the system of record, plus payments and a phased rollout.",
      },
      { property: "og:title", content: "Integration blueprint — Taral Direct" },
      {
        property: "og:description",
        content:
          "Acumatica stays the system of record. This explains the flow, the statuses, and the phased path to production.",
      },
    ],
  }),
  component: Blueprint,
});

type Status = "Prototype mock" | "API contract needed" | "Ready for engineer validation";

const STATUS_TONE: Record<Status, "demo" | "illustrative" | "neutral"> = {
  "Prototype mock": "demo",
  "API contract needed": "illustrative",
  "Ready for engineer validation": "neutral",
};

const OWNERSHIP: [string, string][] = [
  ["Products & specifications", "Acumatica"],
  ["Price classes & customer overrides", "Acumatica"],
  ["Inventory / available-to-sell", "Acumatica"],
  ["Sales orders", "Acumatica"],
  ["Invoices, terms & balances", "Acumatica"],
  ["Payment processing & settlement", "Stripe / Acumatica Payments"],
  ["Public experience & portal UI", "This web application"],
];

const CAPABILITIES: { area: string; status: Status; note: string }[] = [
  {
    area: "Public catalog & specification search",
    status: "Prototype mock",
    note: "Runs on typed demo data files. Needs a read-only product feed from Acumatica.",
  },
  {
    area: "Sample request intake",
    status: "Ready for engineer validation",
    note: "Form and confirmation are defined; contact creation and CS alerting are next.",
  },
  {
    area: "Private pricing & inventory",
    status: "API contract needed",
    note: "Requires the exact price-class and available-to-sell endpoints and refresh cadence.",
  },
  {
    area: "Order submission",
    status: "API contract needed",
    note: "Write path with revalidation, credit hold rules, and duplicate-PO handling.",
  },
  {
    area: "Invoices & payment",
    status: "API contract needed",
    note: "AR read, processor confirmation, and application of payments back to Acumatica.",
  },
  {
    area: "Distributor authentication",
    status: "Ready for engineer validation",
    note: "Each user maps to exactly one Acumatica customer account; no cross-account access.",
  },
];

const PHASES: { n: string; title: string; text: string }[] = [
  {
    n: "Phase 1",
    title: "Validate Acumatica capabilities",
    text: "Confirm which endpoints, licenses, and fields exist today for products, pricing, inventory, orders, invoices, and payments.",
  },
  {
    n: "Phase 2",
    title: "Connect read-only catalog, price & inventory",
    text: "Replace demo data files with cached reads. Nothing is written back, so there is no operational risk.",
  },
  {
    n: "Phase 3",
    title: "Add sample requests & contact sync",
    text: "Sample and quote requests create or match a contact and notify customer service.",
  },
  {
    n: "Phase 4",
    title: "Add order writes",
    text: "Portal orders create sales orders after price and availability are revalidated.",
  },
  {
    n: "Phase 5",
    title: "Add payments & reconciliation",
    text: "Enable card and ACH payment on invoices, apply payments to AR, and reconcile settlement.",
  },
];

function FlowNode({
  label,
  role,
  tone,
}: {
  label: string;
  role: string;
  tone: "app" | "middle" | "erp";
}) {
  const style =
    tone === "erp"
      ? "border-primary bg-secondary"
      : tone === "middle"
        ? "border-dashed border-border bg-card"
        : "border-border bg-card";
  return (
    <div className={`flex-1 border p-4 ${style}`}>
      <p className="font-display text-base font-semibold">{label}</p>
      <p className="spec-note mt-1">{role}</p>
    </div>
  );
}

function Blueprint() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10">
      <div className="border-b border-border pb-6">
        <p className="label-caps text-muted-foreground">Integration blueprint</p>
        <h1 className="mt-3 max-w-[26ch] font-display text-4xl font-bold tracking-tight">
          How this experience would connect to the systems that already run the business.
        </h1>
        <p className="measure mt-4 text-muted-foreground">
          Nothing in this prototype is connected. This page explains, in plain language, what would
          sit where — and what an engineer needs to confirm before anything is built for real.
        </p>
      </div>

      {/* Flow */}
      <section data-demo-target="blueprint" aria-labelledby="flow-heading" className="py-10">
        <h2 id="flow-heading" className="font-display text-2xl font-bold tracking-tight">
          The flow
        </h2>
        <div className="mt-5 flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
          <FlowNode
            label="Public experience & portal"
            role="Catalog, samples, distributor self-service — what customers touch"
            tone="app"
          />
          <ArrowRight
            className="mx-auto size-5 shrink-0 rotate-90 text-muted-foreground lg:rotate-0"
            aria-hidden="true"
          />
          <FlowNode
            label="Secure integration service"
            role="Authenticates the user, caches reads, and never exposes ERP credentials to the browser"
            tone="middle"
          />
          <ArrowRight
            className="mx-auto size-5 shrink-0 rotate-90 text-muted-foreground lg:rotate-0"
            aria-hidden="true"
          />
          <FlowNode
            label="Acumatica"
            role="System of record for products, pricing, inventory, orders, invoices, and balances"
            tone="erp"
          />
        </div>
        <p className="spec-note mt-3">
          Payments run in parallel: the processor confirms the payment, then Acumatica applies it to
          the customer's AR balance.
        </p>
      </section>

      {/* Ownership of data */}
      <section aria-labelledby="own-heading" className="border-t border-border py-10">
        <h2 id="own-heading" className="font-display text-2xl font-bold tracking-tight">
          Who owns which data
        </h2>
        <dl className="mt-5 divide-y divide-border border-y border-border">
          {OWNERSHIP.map(([what, who]) => (
            <div key={what} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-3">
              <dt className="min-w-64 flex-1 text-sm">{what}</dt>
              <dd className="label-caps text-primary">{who}</dd>
            </div>
          ))}
        </dl>
        <div className="measure mt-6 space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Optional middleware.</strong> A lightweight API
            service (for example Supabase Edge Functions) can sit between the site and Acumatica to
            keep requests secure and cache catalog reads so pages stay fast.
          </p>
          <p>
            <strong className="text-foreground">Zapier stays on the edges.</strong> Useful for
            notifications and low-risk workflow automation only — never for authoritative pricing,
            inventory, orders, or payments.
          </p>
        </div>
      </section>

      {/* Status */}
      <section aria-labelledby="status-heading" className="border-t border-border py-10">
        <h2 id="status-heading" className="font-display text-2xl font-bold tracking-tight">
          Current status, honestly labeled
        </h2>
        <ul className="mt-5 grid gap-px bg-border md:grid-cols-2">
          {CAPABILITIES.map((c) => (
            <li key={c.area} className="bg-card p-5">
              <DemoTag tone={STATUS_TONE[c.status]}>{c.status}</DemoTag>
              <h3 className="mt-2 font-display text-base font-semibold">{c.area}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Phases */}
      <section aria-labelledby="phase-heading" className="border-t border-border py-10">
        <h2 id="phase-heading" className="font-display text-2xl font-bold tracking-tight">
          Phased implementation path
        </h2>
        <ol className="mt-5 divide-y divide-border border-y border-border">
          {PHASES.map((p) => (
            <li key={p.n} className="grid gap-2 py-5 md:grid-cols-[8rem_1fr]">
              <p className="label-caps text-accent">{p.n}</p>
              <div>
                <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                <p className="measure mt-1 text-sm text-muted-foreground">{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="spec-note mt-4">
          Each phase is independently useful. Read-only value ships before any write path exists.
        </p>
      </section>

      {/* Ownership standard */}
      <section aria-labelledby="std-heading" className="border-t border-border py-10">
        <h2 id="std-heading" className="font-display text-2xl font-bold tracking-tight">
          Ownership standard
        </h2>
        <p className="measure mt-3 text-sm text-muted-foreground">
          Taral owns everything the business depends on: the domain, the code repository, the
          workspace this was built in, the backend, the connected application registration in
          Acumatica, and the payment account. Any vendor works inside Taral-owned accounts.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {[
            "Domain",
            "Code repository",
            "Build workspace",
            "Backend",
            "Acumatica connected app",
            "Payment account",
          ].map((item) => (
            <li key={item} className="label-caps border border-border px-3 py-1.5">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-border pt-8">
        <Button asChild>
          <Link to="/portal">Open the demo portal</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/catalog">Back to the catalog</Link>
        </Button>
      </div>
    </div>
  );
}
