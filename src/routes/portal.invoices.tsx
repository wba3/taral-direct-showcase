import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Clock, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { PortalShell } from "@/components/portal/PortalShell";
import { DemoTag } from "@/components/site/DemoTag";
import { newReference } from "@/lib/demo-store";
import { usePortalView, downloadTextFile, type InvoiceView } from "@/lib/portal-view";
import { invoiceDocument, printInvoice } from "@/lib/invoice-doc";
import { money } from "@/data/products";
import { services } from "@/lib/adapters/mock";
import type { PaymentMethodKind, PaymentSimulation } from "@/lib/adapters/types";

export const Route = createFileRoute("/portal/invoices")({
  component: Invoices,
});

type Filter = "All" | "Open" | "Overdue" | "Posting pending" | "Paid";
const FILTERS: Filter[] = ["All", "Open", "Overdue", "Posting pending", "Paid"];

const SIMULATIONS: { id: PaymentSimulation; label: string; blurb: string }[] = [
  {
    id: "Applied",
    label: "Succeeds and posts",
    blurb: "Collected and applied to the balance in the same step.",
  },
  {
    id: "Declined",
    label: "Declined by the processor",
    blurb: "Nothing is collected; the balance is unchanged.",
  },
  {
    id: "Received — ERP posting pending",
    label: "Collected, posting not finished",
    blurb: "Money is held as received but unapplied until Taral staff retry the posting.",
  },
];

function StatusMark({ view }: { view: InvoiceView }) {
  const tone =
    view.status === "Overdue"
      ? "text-destructive"
      : view.status === "Paid"
        ? "text-muted-foreground"
        : view.status === "Posting pending"
          ? "text-accent"
          : "text-primary";
  return <span className={`label-caps ${tone}`}>{view.status}</span>;
}

function Invoices() {
  const {
    account,
    role,
    invoices,
    totals,
    recordPayment,
    attempts,
    todayLabel,
  } = usePortalView();
  const [filter, setFilter] = useState<Filter>("All");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [payId, setPayId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethodKind>("card");
  const [simulate, setSimulate] = useState<PaymentSimulation>("Applied");
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [steps, setSteps] = useState<string[] | null>(null);
  const [idemKey, setIdemKey] = useState<string>(() => newReference("IDEMP"));

  const canPay = role === "finance";
  const detail = invoices.find((v) => v.invoice.id === detailId) ?? null;
  const payTarget = invoices.find((v) => v.invoice.id === payId) ?? null;

  const visible = useMemo(
    () => (filter === "All" ? invoices : invoices.filter((v) => v.status === filter)),
    [filter, invoices],
  );

  if (!account) {
    return (
      <PortalShell account={null} title="Invoices">
        <p className="text-sm text-muted-foreground">
          Choose a demo account in Demo controls to see invoices.
        </p>
      </PortalShell>
    );
  }

  const openPay = (view: InvoiceView) => {
    setPayId(view.invoice.id);
    setAmount(view.outstanding.toFixed(2));
    setSimulate("Applied");
    setSteps(null);
    setIdemKey(newReference("IDEMP"));
  };

  const runPayment = async () => {
    if (!payTarget) return;
    setProcessing(true);
    const res = await services.payments.createPaymentIntent({
      accountId: account.id,
      invoiceId: payTarget.invoice.id,
      amount: Number(amount),
      method,
      simulate,
    });
    const outcome = recordPayment({
      invoiceId: payTarget.invoice.id,
      amount: Number(amount),
      outcome: simulate,
      idempotencyKey: idemKey,
    });
    setProcessing(false);
    setSteps(res.data.settlementSteps);
    if (outcome.duplicate) {
      toast.info("Already recorded", { description: outcome.message });
      return;
    }
    if (!outcome.attempt) {
      toast.error("Collection refused by the prototype", { description: outcome.message });
      return;
    }
    if (simulate === "Declined") toast.error("Simulated decline", { description: outcome.message });
    else if (simulate === "Applied")
      toast.success("Simulated payment applied", { description: outcome.message });
    else toast.warning("Received, posting pending", { description: outcome.message });
  };

  const exportCsv = () => {
    const header = ["DEMO DATA — Taral Direct prototype", `Account ${account.id}`, todayLabel];
    const rows = [
      header,
      ["Invoice", "Order", "Issued", "Discount by", "Due", "Original", "Credit", "Paid", "Pending", "Outstanding", "Status"],
      ...invoices.map((v) => [
        v.invoice.id,
        v.invoice.orderRef,
        v.invoice.issueDate,
        v.invoice.discountDate,
        v.invoice.dueDate,
        v.invoice.originalTotal.toFixed(2),
        v.credit.toFixed(2),
        v.paid.toFixed(2),
        v.pending.toFixed(2),
        v.outstanding.toFixed(2),
        v.status,
      ]),
    ];
    downloadTextFile(
      `demo-invoices-${account.id}.csv`,
      rows.map((r) => r.join(",")).join("\r\n"),
    );
    toast.success("Demo invoice list downloaded");
  };

  return (
    <PortalShell
      account={account}
      title="Invoices"
      intro={
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="measure text-sm text-muted-foreground">
            Balances for {account.name} on terms {account.terms}. Every amount is derived from the
            seeded invoices plus what happened in this browser. Payment is a labeled simulation: no
            card or bank details are collected and no money moves.
          </p>
          <p className="tabular text-right">
            <span className="label-caps block text-muted-foreground">Outstanding balance</span>
            <span className="font-display text-2xl font-bold">{money(totals.outstanding, 2)}</span>
            {totals.pending > 0 && (
              <span className="spec-note block text-accent">
                {money(totals.pending, 2)} received, not yet posted
              </span>
            )}
            <DemoTag className="mt-1 block w-fit" />
          </p>
        </div>
      }
    >
      <div data-demo-target="invoices">
        <div className="flex flex-wrap items-center gap-2 pb-4">
          <div role="group" aria-label="Filter invoices" className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`label-caps border px-3 py-1.5 ${
                  filter === f
                    ? "border-accent text-accent"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button variant="rail" size="sm" className="ml-auto" onClick={exportCsv}>
            <Download className="size-3.5" /> Export demo CSV
          </Button>
        </div>

        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <caption className="sr-only">Demo invoices for {account.name}</caption>
            <thead>
              <tr className="border-b border-border bg-secondary text-left">
                {["Invoice", "Order", "Issued", "Discount by", "Due", "Original", "Paid", "Outstanding", "Status", ""].map(
                  (h) => (
                    <th key={h} scope="col" className="label-caps px-3 py-2.5 text-muted-foreground">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {visible.map((v) => (
                <tr key={v.invoice.id} className="border-b border-border last:border-0 hover:bg-secondary">
                  <th scope="row" className="spec-note px-3 py-3 text-left text-foreground">
                    {v.invoice.id}
                  </th>
                  <td className="spec-note px-3 py-3">{v.invoice.orderRef}</td>
                  <td className="spec-note px-3 py-3">{v.invoice.issueDate}</td>
                  <td className="spec-note px-3 py-3">
                    {v.invoice.discountDate}
                    {v.discountOpen && <span className="label-caps ml-1 text-primary">Open</span>}
                  </td>
                  <td className="spec-note px-3 py-3">{v.invoice.dueDate}</td>
                  <td className="tabular px-3 py-3">{money(v.invoice.originalTotal, 2)}</td>
                  <td className="tabular px-3 py-3">{money(v.paid, 2)}</td>
                  <td className="tabular px-3 py-3">{money(v.outstanding, 2)}</td>
                  <td className="px-3 py-3">
                    <StatusMark view={v} />
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <button onClick={() => setDetailId(v.invoice.id)} className="label-caps text-primary hover:underline">
                      Detail
                    </button>
                    {canPay && v.outstanding > 0 && v.pending === 0 && (
                      <button onClick={() => openPay(v)} className="label-caps ml-3 text-accent hover:underline">
                        Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No invoices in this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!canPay && (
          <p className="spec-note mt-3">
            Payment actions are shown only to the customer finance role in this demo. Switch role in
            Demo controls to run one.
          </p>
        )}

        {attempts.length > 0 && (
          <section aria-labelledby="attempts-heading" className="mt-8">
            <h2 id="attempts-heading" className="label-caps text-muted-foreground">
              Simulated collection attempts
            </h2>
            <ul className="mt-2 divide-y divide-border border-y border-border">
              {attempts.map((a) => (
                <li key={a.id} className="flex flex-wrap items-baseline gap-x-3 py-2 text-sm">
                  <span className="spec-note text-foreground">{a.id}</span>
                  <span>{a.invoiceId}</span>
                  <span className="tabular">{money(a.amount, 2)}</span>
                  <span
                    className={`label-caps ${
                      a.outcome === "Declined"
                        ? "text-destructive"
                        : a.outcome === "Applied"
                          ? "text-primary"
                          : "text-accent"
                    }`}
                  >
                    {a.outcome}
                  </span>
                  {a.postedAt && <span className="spec-note">posted on retry</span>}
                </li>
              ))}
            </ul>
            <p className="mt-2">
              <DemoTag tone="neutral">Simulated · no processor involved</DemoTag>
            </p>
          </section>
        )}
      </div>

      {/* Detail sheet */}
      <Sheet open={Boolean(detail)} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          {detail && (
            <>
              <SheetTitle className="font-display text-xl">Invoice {detail.invoice.id}</SheetTitle>
              <p className="spec-note mt-1">
                Order {detail.invoice.orderRef} · issued {detail.invoice.issueDate} · due{" "}
                {detail.invoice.dueDate}
              </p>
              <p className="mt-2">
                <StatusMark view={detail} />
              </p>

              {detail.pending > 0 && (
                <p className="mt-4 flex gap-2 border border-accent/50 bg-accent/5 p-3 text-sm">
                  <Clock className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  <span>
                    {money(detail.pending, 2)} was collected in the simulation but has not been
                    applied. Taral operations must retry the posting; another charge is blocked.
                  </span>
                </p>
              )}
              {detail.overdue && (
                <p className="mt-4 flex gap-2 border border-destructive/40 bg-destructive/5 p-3 text-sm">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                  <span>Past the due date in the demo calendar ({todayLabel}).</span>
                </p>
              )}

              <h3 className="label-caps mt-6 text-muted-foreground">Lines</h3>
              <ul className="mt-2 divide-y divide-border border-y border-border">
                {detail.invoice.lines.map((l) => (
                  <li key={l.description} className="flex items-baseline justify-between gap-3 py-3 text-sm">
                    <span>
                      {l.description}
                      <span className="spec-note block">{l.qty}</span>
                    </span>
                    <span className="tabular">{money(l.amount, 2)}</span>
                  </li>
                ))}
              </ul>

              <dl className="tabular mt-4 space-y-1 text-sm">
                {[
                  ["Original", money(detail.invoice.originalTotal, 2)],
                  ["Credit applied", `-${money(detail.credit, 2)}`],
                  ["Payments applied", `-${money(detail.paid, 2)}`],
                  ...(detail.pending > 0
                    ? [["Received, not posted", money(detail.pending, 2)] as const]
                    : []),
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd>{val}</dd>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-2 font-display text-lg font-semibold">
                  <dt>Outstanding</dt>
                  <dd>{money(detail.outstanding, 2)}</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const ok = printInvoice(detail, account);
                    if (!ok) toast.error("The print view could not open in this browser.");
                  }}
                >
                  <Printer className="size-4" /> Print demo invoice
                </Button>
                <Button
                  variant="rail"
                  onClick={() => {
                    downloadTextFile(
                      `DEMO-invoice-${detail.invoice.id}.html`,
                      invoiceDocument(detail, account),
                      "text/html",
                    );
                    toast.success("Demo invoice downloaded", {
                      description: "Open it and use your browser's Save as PDF.",
                    });
                  }}
                >
                  <Download className="size-4" /> Download
                </Button>
                {canPay && detail.outstanding > 0 && detail.pending === 0 && (
                  <Button variant="accent" onClick={() => openPay(detail)}>
                    Simulate payment
                  </Button>
                )}
              </div>
              <p className="mt-3">
                <DemoTag>Demo data · document marked DEMO</DemoTag>
              </p>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Payment simulation */}
      <Dialog open={Boolean(payTarget)} onOpenChange={(o) => !o && setPayId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {payTarget && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  Simulate a payment on {payTarget.invoice.id}
                </DialogTitle>
                <DialogDescription>
                  No card or bank details are requested and nothing is transmitted. Choose the
                  outcome you want to show.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="pay-amount" className="label-caps text-muted-foreground">
                    Amount (outstanding {money(payTarget.outstanding, 2)})
                  </Label>
                  <Input
                    id="pay-amount"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="tabular mt-1 rounded-sm"
                  />
                </div>

                <fieldset>
                  <legend className="label-caps text-muted-foreground">Method</legend>
                  <RadioGroup
                    value={method}
                    onValueChange={(v) => setMethod(v as PaymentMethodKind)}
                    className="mt-2 flex gap-2"
                  >
                    {(["card", "ach"] as PaymentMethodKind[]).map((m) => (
                      <label
                        key={m}
                        className="flex flex-1 cursor-pointer items-center gap-2 border border-border p-3 text-sm has-[:checked]:border-primary"
                      >
                        <RadioGroupItem value={m} />
                        {m === "card" ? "Card" : "Bank transfer (ACH)"}
                      </label>
                    ))}
                  </RadioGroup>
                  <p className="spec-note mt-1">Method is recorded as a label only.</p>
                </fieldset>

                <fieldset>
                  <legend className="label-caps text-muted-foreground">Outcome to simulate</legend>
                  <RadioGroup
                    value={simulate}
                    onValueChange={(v) => setSimulate(v as PaymentSimulation)}
                    className="mt-2 space-y-2"
                  >
                    {SIMULATIONS.map((s) => (
                      <label
                        key={s.id}
                        className="flex cursor-pointer gap-3 border border-border p-3 text-sm has-[:checked]:border-primary"
                      >
                        <RadioGroupItem value={s.id} className="mt-0.5" />
                        <span>
                          <span className="block font-medium">{s.label}</span>
                          <span className="spec-note">{s.blurb}</span>
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                </fieldset>

                {steps && (
                  <div className="border border-border bg-secondary p-3">
                    <p className="label-caps flex items-center gap-2 text-primary">
                      <CheckCircle2 className="size-3.5" aria-hidden="true" /> What a connected
                      system would do
                    </p>
                    <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {steps.map((s, i) => (
                        <li key={s}>
                          {i + 1}. {s}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <DemoTag tone="neutral">No financial details collected</DemoTag>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setPayId(null)}>
                    Close
                  </Button>
                  <Button variant="accent" onClick={runPayment} disabled={processing}>
                    {processing ? "Simulating…" : "Run simulation"}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PortalShell>
  );
}
