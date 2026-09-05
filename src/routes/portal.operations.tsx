import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/PortalShell";
import { DemoTag } from "@/components/site/DemoTag";
import { usePortalView } from "@/lib/portal-view";
import { INVOICES } from "@/data/portal";
import { money } from "@/data/products";
import type { SampleStatus } from "@/lib/demo-store";

export const Route = createFileRoute("/portal/operations")({
  component: Operations,
});

const NEXT_ACTIONS: {
  status: SampleStatus;
  label: string;
  note: string;
  from: SampleStatus[];
  tone?: "accent" | "outline" | "rail";
}[] = [
  {
    status: "Approved",
    label: "Approve request",
    note: "Customer service approved the request (simulated).",
    from: ["Received"],
    tone: "accent",
  },
  {
    status: "Queued for ERP",
    label: "Queue for ERP",
    note: "Queued for the ERP contact and sample fulfillment record (simulated — nothing sent).",
    from: ["Approved", "Sync failed (simulated)"],
  },
  {
    status: "Synced (simulated)",
    label: "Simulate successful sync",
    note: "Simulated sync completed: contact matched and fulfillment record created (no real ERP call).",
    from: ["Queued for ERP", "Sync failed (simulated)"],
  },
  {
    status: "Sync failed (simulated)",
    label: "Simulate sync failure",
    note: "Simulated failure: duplicate contact match required a human decision. Retry is available.",
    from: ["Queued for ERP"],
    tone: "outline",
  },
  {
    status: "Shipped (simulated)",
    label: "Mark shipped",
    note: "Marked shipped in the prototype (simulated — no carrier label created).",
    from: ["Synced (simulated)"],
  },
];

function Operations() {
  const { sampleRequests, advanceSample, payments, postPending, attempts, todayLabel } =
    usePortalView();

  const pendingPostings = Object.entries(payments)
    .filter(([, s]) => s.pending > 0)
    .map(([invoiceId, s]) => ({
      invoiceId,
      pending: s.pending,
      invoice: INVOICES.find((i) => i.id === invoiceId) ?? null,
    }));

  return (
    <PortalShell
      account={null}
      title="Operations queue"
      intro={
        <p className="measure text-sm text-muted-foreground">
          Internal view for Taral customer service, as of {todayLabel}. Every action here is a
          labeled simulation inside this browser: no ERP contact, order, or shipment is created and
          no email is sent.
        </p>
      }
    >
      <section aria-labelledby="samples-heading" data-demo-target="operations">
        <h2 id="samples-heading" className="label-caps text-muted-foreground">
          Sample requests ({sampleRequests.length})
        </h2>

        {sampleRequests.length === 0 ? (
          <div className="mt-3 border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              The queue is empty. Submit a request from the{" "}
              <Link to="/samples" className="text-primary hover:underline">
                sample request page
              </Link>{" "}
              to process one.
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-4">
            {sampleRequests.map((r) => (
              <li key={r.reference} className="panel p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="spec-note text-foreground">{r.reference}</p>
                    <h3 className="font-display text-lg font-semibold">{r.contact.company}</h3>
                    <p className="spec-note">
                      {r.contact.name} · {r.contact.email} · {r.items.length} item(s) ·{" "}
                      {r.shipping}
                    </p>
                  </div>
                  <p className="text-right">
                    <span
                      className={`label-caps block ${
                        r.status === "Sync failed (simulated)" ? "text-destructive" : "text-accent"
                      }`}
                    >
                      {r.status}
                    </span>
                    <span className="spec-note">{new Date(r.submittedAt).toLocaleString()}</span>
                  </p>
                </div>

                {r.status === "Sync failed (simulated)" && (
                  <p className="mt-3 flex gap-2 border border-destructive/40 bg-destructive/5 p-3 text-sm">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                    <span>
                      Simulated exception. In production this is where a duplicate contact match
                      would be resolved before the record is written.
                    </span>
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {NEXT_ACTIONS.filter((a) => a.from.includes(r.status)).map((a) => (
                    <Button
                      key={a.label}
                      size="sm"
                      variant={a.tone ?? "rail"}
                      onClick={() => {
                        advanceSample(r.reference, a.status, a.note);
                        toast.success(`${r.reference} → ${a.status}`, {
                          description: "Simulation only — no external system was contacted.",
                        });
                      }}
                    >
                      {a.status === "Synced (simulated)" && <RefreshCw className="size-3.5" />}
                      {a.label}
                    </Button>
                  ))}
                  {r.status === "Shipped (simulated)" && (
                    <p className="spec-note">Nothing further to do in the prototype.</p>
                  )}
                </div>

                <details className="mt-3">
                  <summary className="label-caps cursor-pointer text-primary">
                    History ({r.events.length})
                  </summary>
                  <ol className="mt-2 space-y-1">
                    {r.events.map((e) => (
                      <li key={e.at + e.text} className="spec-note">
                        {new Date(e.at).toLocaleString()} — {e.text}
                      </li>
                    ))}
                  </ol>
                </details>

                <p className="mt-3">
                  <DemoTag>Simulated processing</DemoTag>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="postings-heading" className="mt-12" data-demo-target="ops-postings">
        <h2 id="postings-heading" className="label-caps text-muted-foreground">
          Payments received, posting not finished ({pendingPostings.length})
        </h2>
        {pendingPostings.length === 0 ? (
          <p className="spec-note mt-3">
            Nothing waiting. A finance user can create one by choosing “Collected, posting not
            finished” in the payment simulation.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {pendingPostings.map((p) => (
              <li key={p.invoiceId} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                <span className="spec-note text-foreground">{p.invoiceId}</span>
                <span>{p.invoice?.accountId ?? "—"}</span>
                <span className="tabular">{money(p.pending, 2)} received, unapplied</span>
                <Button
                  size="sm"
                  variant="accent"
                  className="ml-auto"
                  onClick={() => {
                    const res = postPending(p.invoiceId);
                    if (res.ok)
                      toast.success(`Posting completed for ${p.invoiceId}`, {
                        description: res.message,
                      });
                    else toast.info("Nothing to post", { description: res.message });
                  }}
                >
                  <RefreshCw className="size-3.5" /> Retry posting
                </Button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3">
          <DemoTag tone="neutral">Simulated · retry is idempotent</DemoTag>
        </p>
      </section>

      {attempts.length > 0 && (
        <section aria-labelledby="attempts-heading" className="mt-12">
          <h2 id="attempts-heading" className="label-caps text-muted-foreground">
            Collection attempt log
          </h2>
          <ul className="mt-2 divide-y divide-border border-y border-border">
            {attempts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline gap-x-3 py-2 text-sm">
                <span className="spec-note text-foreground">{a.id}</span>
                <span>{a.invoiceId}</span>
                <span>{a.accountId}</span>
                <span className="tabular">{money(a.amount, 2)}</span>
                <span className="label-caps text-accent">{a.outcome}</span>
                <span className="spec-note">{new Date(a.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PortalShell>
  );
}
