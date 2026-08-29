import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, Download, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { PortalShell } from "@/components/portal/PortalShell";
import { DemoTag } from "@/components/site/DemoTag";
import { useDemo } from "@/lib/demo-store";
import { ACCOUNT, INVOICES, getAccount, type DemoInvoice } from "@/data/portal";
import { money } from "@/data/products";
import { services } from "@/lib/adapters/mock";
import type { PaymentIntentResult, PaymentMethodKind } from "@/lib/adapters/types";

export const Route = createFileRoute("/portal/invoices")({
  component: Invoices,
});

type Filter = "All" | "Open" | "Paid" | "Overdue";
const FILTERS: Filter[] = ["All", "Open", "Paid", "Overdue"];

function Invoices() {
  const { accountId, paidInvoices, markInvoicePaid } = useDemo();
  const account = getAccount(accountId) ?? ACCOUNT;
  const [filter, setFilter] = useState<Filter>("All");
  const [detail, setDetail] = useState<DemoInvoice | null>(null);
  const [payTarget, setPayTarget] = useState<DemoInvoice | null>(null);
  const [method, setMethod] = useState<PaymentMethodKind>("card");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<PaymentIntentResult | null>(null);

  const rows = INVOICES.filter((i) => i.accountId === account.id).map((i) =>
    paidInvoices.includes(i.id) ? { ...i, status: "Paid" as const, balance: 0 } : i,
  );
  const visible = filter === "All" ? rows : rows.filter((i) => i.status === filter);
  const openBalance = rows.reduce((sum, i) => sum + i.balance, 0);

  const pay = async () => {
    if (!payTarget) return;
    setProcessing(true);
    const res = await services.payments.createPaymentIntent({
      accountId: account.id,
      invoiceId: payTarget.id,
      amount: payTarget.balance,
      method,
    });
    setProcessing(false);
    setReceipt(res.data);
    markInvoicePaid(payTarget.id);
    toast.success("Demo payment recorded locally", {
      description: "No payment was processed and no money moved.",
    });
  };

  return (
    <PortalShell
      account={account}
      title="Invoices"
      intro={
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="measure text-sm text-muted-foreground">
            Open balance for {account.name}. Terms {account.terms}. Payment is presented here as a
            clearly labeled demo — no financial details are collected and no transaction occurs.
          </p>
          <p className="tabular text-right">
            <span className="label-caps block text-muted-foreground">Open balance</span>
            <span className="font-display text-2xl font-bold">{money(openBalance, 0)}</span>
            <DemoTag className="mt-1 block w-fit" />
          </p>
        </div>
      }
    >
      <div data-demo-target="invoices">
        <div role="group" aria-label="Filter invoices" className="flex flex-wrap gap-1 pb-4">
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

        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <caption className="sr-only">Demo invoices for {account.name}</caption>
            <thead>
              <tr className="border-b border-border bg-secondary text-left">
                {[
                  "Invoice",
                  "Order",
                  "Issued",
                  "Discount by",
                  "Due",
                  "Original",
                  "Balance",
                  "Status",
                  "",
                ].map((h) => (
                  <th key={h} scope="col" className="label-caps px-3 py-2.5 text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-secondary">
                  <th scope="row" className="spec-note px-3 py-3 text-left text-foreground">
                    {inv.id}
                  </th>
                  <td className="spec-note px-3 py-3">{inv.orderRef}</td>
                  <td className="spec-note px-3 py-3">{inv.issueDate}</td>
                  <td className="spec-note px-3 py-3">{inv.discountDate}</td>
                  <td className="spec-note px-3 py-3">{inv.dueDate}</td>
                  <td className="tabular px-3 py-3">{money(inv.originalTotal, 0)}</td>
                  <td className="tabular px-3 py-3">{money(inv.balance, 0)}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`label-caps ${
                        inv.status === "Overdue"
                          ? "text-destructive"
                          : inv.status === "Paid"
                            ? "text-muted-foreground"
                            : "text-primary"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setDetail(inv)}
                        className="label-caps text-primary hover:underline"
                      >
                        Detail
                      </button>
                      {inv.balance > 0 && (
                        <button
                          onClick={() => {
                            setReceipt(null);
                            setMethod("card");
                            setPayTarget(inv);
                          }}
                          className="label-caps text-accent hover:underline"
                        >
                          Pay now
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visible.length === 0 && (
          <p className="border-x border-b border-border p-6 text-sm text-muted-foreground">
            No {filter.toLowerCase()} invoices in the demo data set.
          </p>
        )}
        <p className="spec-note mt-3">
          Partial payments, short-pays, and disputed lines are planned capabilities — they are not
          simulated here. Data as of {account.asOf}.
        </p>
      </div>

      {/* Invoice detail */}
      <Sheet open={Boolean(detail)} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          {detail && (
            <>
              <SheetTitle className="font-display text-xl">Invoice {detail.id}</SheetTitle>
              <p className="spec-note mt-1">
                Order {detail.orderRef} · Issued {detail.issueDate} · Due {detail.dueDate}
              </p>
              <ul className="mt-6 divide-y divide-border border-y border-border">
                {detail.lines.map((line) => (
                  <li key={line.description} className="flex items-baseline gap-3 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{line.description}</span>
                      <span className="spec-note">{line.qty}</span>
                    </span>
                    <span className="tabular text-sm">{money(line.amount, 0)}</span>
                  </li>
                ))}
              </ul>
              <dl className="tabular mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Original total</dt>
                  <dd>{money(detail.originalTotal, 0)}</dd>
                </div>
                <div className="flex justify-between font-semibold">
                  <dt>Remaining balance</dt>
                  <dd>{money(detail.balance, 0)}</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.info("Simulated download", {
                      description: `A PDF of ${detail.id} would download here.`,
                    })
                  }
                >
                  <Download className="size-4" /> Download PDF (simulated)
                </Button>
                {detail.balance > 0 && (
                  <Button
                    variant="accent"
                    onClick={() => {
                      setDetail(null);
                      setReceipt(null);
                      setPayTarget(detail);
                    }}
                  >
                    Pay now (demo)
                  </Button>
                )}
              </div>
              <p className="mt-3">
                <DemoTag>Demo data</DemoTag>
              </p>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Demo payment modal */}
      <Dialog
        open={Boolean(payTarget)}
        onOpenChange={(o) => {
          if (!o) {
            setPayTarget(null);
            setReceipt(null);
          }
        }}
      >
        <DialogContent className="max-w-lg rounded-sm">
          {payTarget && !receipt && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">
                  Demo payment · {payTarget.id}
                </DialogTitle>
                <DialogDescription>
                  This is a presentation of the payment step only. No card or bank fields are
                  collected, no credentials are requested, and no transaction is created.
                </DialogDescription>
              </DialogHeader>

              <p className="tabular flex items-baseline justify-between border-y border-border py-3">
                <span className="label-caps text-muted-foreground">Amount due</span>
                <span className="font-display text-xl font-semibold">
                  {money(payTarget.balance, 0)}
                </span>
              </p>

              <fieldset>
                <legend className="label-caps text-muted-foreground">Payment method</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      ["card", "Card", CreditCard, "Processed by Stripe / Acumatica Payments"],
                      ["ach", "ACH bank transfer", Landmark, "Lower fee, 2–3 day settlement"],
                    ] as const
                  ).map(([value, label, Icon, note]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMethod(value)}
                      aria-pressed={method === value}
                      className={`border p-3 text-left ${
                        method === value ? "border-accent" : "border-border hover:border-foreground"
                      }`}
                    >
                      <span className="label-caps flex items-center gap-2">
                        <Icon className="size-4" aria-hidden="true" /> {label}
                      </span>
                      <span className="spec-note mt-1 block">{note}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <DialogFooter className="mt-2">
                <Button variant="outline" onClick={() => setPayTarget(null)}>
                  Cancel
                </Button>
                <Button variant="accent" onClick={pay} disabled={processing}>
                  {processing ? "Simulating…" : "Simulate payment"}
                </Button>
              </DialogFooter>
              <p>
                <DemoTag tone="neutral">No live payment processing is connected</DemoTag>
              </p>
            </>
          )}

          {payTarget && receipt && (
            <>
              <DialogHeader>
                <DialogTitle className="label-caps flex items-center gap-2 text-primary">
                  <CheckCircle2 className="size-4" aria-hidden="true" /> Simulated only
                </DialogTitle>
                <DialogDescription>
                  Reference {receipt.reference}. Nothing was charged. In the connected system this
                  is what would happen:
                </DialogDescription>
              </DialogHeader>
              <ol className="divide-y divide-border border-y border-border">
                {receipt.settlementSteps.map((step, i) => (
                  <li key={step} className="flex gap-4 py-3">
                    <span className="spec-note text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="text-sm text-muted-foreground">
                Partial payments, short-pay handling, and dispute flags would be added in the
                payments phase of the implementation plan.
              </p>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setPayTarget(null);
                    setReceipt(null);
                  }}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PortalShell>
  );
}
