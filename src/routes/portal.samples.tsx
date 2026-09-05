import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/PortalShell";
import { DemoTag } from "@/components/site/DemoTag";
import { usePortalView } from "@/lib/portal-view";

export const Route = createFileRoute("/portal/samples")({
  component: PortalSamples,
});

function PortalSamples() {
  const { account, role, sampleRequests, todayLabel } = usePortalView();
  const requests = sampleRequests.filter(
    (r) => role === "ops" || !account || r.accountId === null || r.accountId === account.id,
  );

  return (
    <PortalShell
      account={role === "ops" ? null : account}
      title="Sample requests"
      intro={
        <p className="measure text-sm text-muted-foreground">
          Sample requests submitted from this browser, newest first, as of {todayLabel}. Statuses are
          simulated; nothing was sent to a business system.
        </p>
      }
    >
      {requests.length === 0 ? (
        <div className="border border-dashed border-border p-10 text-center">
          <h2 className="font-display text-lg font-semibold">No sample requests yet</h2>
          <p className="measure mx-auto mt-2 text-sm text-muted-foreground">
            Submit one from the public sample request page and it will appear here.
          </p>
          <Button className="mt-5" asChild>
            <Link to="/samples">Go to sample request</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {requests.map((r) => (
            <li key={r.reference} className="panel p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="spec-note text-foreground">{r.reference}</p>
                  <h2 className="font-display text-lg font-semibold">{r.contact.company}</h2>
                  <p className="spec-note">
                    {r.contact.name} · {r.contact.email} · {r.contact.phone}
                  </p>
                </div>
                <p className="text-right">
                  <span className="label-caps block text-accent">{r.status}</span>
                  <span className="spec-note">{new Date(r.submittedAt).toLocaleString()}</span>
                </p>
              </div>

              <p className="spec-note mt-3">
                Ship method: {r.shipping}
                {r.accountId ? ` · Account ${r.accountId}` : " · Guest request"}
              </p>
              {r.notes && <p className="mt-2 text-sm text-muted-foreground">“{r.notes}”</p>}

              <ul className="mt-3 divide-y divide-border border-y border-border">
                {r.items.map((i) => (
                  <li key={i.productId} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                    <span>
                      <span className="spec-note block text-foreground">{i.code}</span>
                      {i.name}
                      {i.note && <span className="spec-note block">Note: {i.note}</span>}
                    </span>
                    <span className="tabular">{i.qty}</span>
                  </li>
                ))}
              </ul>

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
                <DemoTag>Simulated status</DemoTag>
              </p>
            </li>
          ))}
        </ul>
      )}

      {role !== "ops" && requests.length > 0 && (
        <p className="spec-note mt-4">
          Taral staff process these in the Operations view — switch to the Taral operations role in
          Demo controls to run the approval and sync steps.
        </p>
      )}
    </PortalShell>
  );
}
