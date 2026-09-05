import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DemoTag } from "@/components/site/DemoTag";
import {
  useDemo,
  wholeQty,
  newReference,
  SAMPLE_MAX_QTY,
  type SampleRequest,
} from "@/lib/demo-store";
import { services } from "@/lib/adapters/mock";

export const Route = createFileRoute("/samples")({
  head: () => ({
    meta: [
      { title: "Sample request — evaluate before you commit | Taral Direct" },
      {
        name: "description",
        content:
          "Build a sample request for Taral Plastics jars and closures, choose ground or your own carrier account, and review what happens next.",
      },
      { property: "og:title", content: "Request packaging samples — Taral Direct" },
      {
        property: "og:description",
        content: "Shortlist containers and closures and request samples for evaluation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Samples,
});

const DEMO_DETAILS = {
  company: "Meridian Labs (demo)",
  name: "Dana Whitfield",
  email: "dana.whitfield@example.com",
  phone: "(555) 010-2200",
  address: "1400 Kestrel Way, Suite 210\nReno, NV 89502\nUnited States",
  notes: "Checking fill volume at 8 oz and closure torque with a foam liner.",
};

type Shipping = "ground-complimentary" | "customer-carrier-account";

function Samples() {
  const { samples, updateSample, removeSample, clearSamples, submitSampleRequest, accountId } =
    useDemo();
  const [shipping, setShipping] = useState<Shipping>("ground-complimentary");
  const [carrierAccount, setCarrierAccount] = useState("");
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [idemKey, setIdemKey] = useState(() => newReference("IDEMP"));
  const [result, setResult] = useState<{ request: SampleRequest; followUp: string[] } | null>(null);

  const total = samples.reduce((n, l) => n + l.qty, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (samples.length === 0 || submitting || result) return;
    if (shipping === "customer-carrier-account" && carrierAccount.trim().length < 4) {
      toast.error("Add your carrier account number", {
        description: "Expedited shipping needs a UPS or FedEx account number.",
      });
      return;
    }
    setSubmitting(true);
    const res = await services.erp.submitSampleRequest({
      contact: { ...form },
      shipping,
      carrierAccount,
      items: samples.map((l) => ({ productId: l.productId, code: l.code, qty: l.qty, note: l.note })),
      notes: form.notes,
    });
    const request = submitSampleRequest({
      idempotencyKey: idemKey,
      accountId,
      contact: {
        company: form.company,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      },
      shipping:
        shipping === "ground-complimentary"
          ? "Complimentary ground"
          : `Customer carrier account ${carrierAccount}`,
      carrierAccount,
      notes: form.notes,
      items: samples.map((l) => ({
        productId: l.productId,
        code: l.code,
        name: l.name,
        qty: l.qty,
        note: l.note,
      })),
    });
    setSubmitting(false);
    setResult({ request, followUp: res.data.followUp });
    toast.success(`Sample request ${request.reference} recorded`, {
      description: "Prototype confirmation — nothing was transmitted and no email was sent.",
    });
  };

  if (result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="panel p-6 sm:p-10">
          <p className="label-caps flex items-center gap-2 text-primary">
            <CheckCircle2 className="size-4" aria-hidden="true" /> Confirmation
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
            Sample request {result.request.reference} recorded.
          </h1>
          <p className="spec-note mt-2">
            {new Date(result.request.submittedAt).toLocaleString()} ·{" "}
            {result.request.items.length} item(s) · status {result.request.status}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            This is a prototype confirmation. The request is saved in this browser only — nothing was
            transmitted, no email was sent, and no record was created in any business system.
          </p>

          <h2 className="label-caps mt-8 text-muted-foreground">Requested items</h2>
          <ul className="mt-2 divide-y divide-border border-y border-border">
            {result.request.items.map((i) => (
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

          <h2 className="label-caps mt-8 text-muted-foreground">
            What the connected system would do next
          </h2>
          <ol className="mt-3 divide-y divide-border border-y border-border">
            {result.followUp.map((step, i) => (
              <li key={step} className="flex gap-4 py-3">
                <span className="spec-note text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/portal/samples">View sample request</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/catalog">Back to products</Link>
            </Button>
            <Button
              variant="rail"
              onClick={() => {
                setResult(null);
                setIdemKey(newReference("IDEMP"));
              }}
            >
              Start another request
            </Button>
          </div>
          <p className="mt-4">
            <DemoTag tone="neutral">Prototype · saved in this browser only</DemoTag>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="border-b border-border pb-5">
        <p className="label-caps text-muted-foreground">Sample request</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
          Evaluate the container before you commit the line.
        </h1>
        <p className="measure mt-2 text-sm text-muted-foreground">
          Samples are handled separately from purchase orders: request up to {SAMPLE_MAX_QTY} pieces
          of each item with no case minimum and no handling fee. Merchandise orders keep their whole
          case minimum and small-order handling.
        </p>
      </div>

      <div data-demo-target="sample-cart" className="grid min-w-0 gap-10 pt-6 lg:grid-cols-[1fr_380px]">
        <section aria-labelledby="cart-heading" className="min-w-0">
          <div className="flex items-baseline justify-between">
            <h2 id="cart-heading" className="label-caps text-muted-foreground">
              Requested items ({total})
            </h2>
            {samples.length > 0 && (
              <button onClick={clearSamples} className="label-caps text-accent hover:underline">
                Empty basket
              </button>
            )}
          </div>

          {samples.length === 0 ? (
            <div className="mt-4 border border-dashed border-border p-6 text-center sm:p-10">
              <h3 className="font-display text-lg font-semibold">Nothing shortlisted yet</h3>
              <p className="measure mx-auto mt-2 text-sm text-muted-foreground">
                Add jars, closures, or discs from the products pages. Sample requests are the fastest
                way to confirm thread fit and fill volume.
              </p>
              <Button className="mt-5" asChild>
                <Link to="/catalog">Browse products</Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {samples.map((line) => (
                <li key={line.productId} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <p className="spec-note text-foreground">{line.code}</p>
                    <Link
                      to="/product/$id"
                      params={{ id: line.productId }}
                      className="font-display text-base font-semibold hover:underline"
                    >
                      {line.name}
                    </Link>
                    <div className="mt-2">
                      <Label
                        htmlFor={`note-${line.productId}`}
                        className="label-caps text-muted-foreground"
                      >
                        Note for customer service
                      </Label>
                      <Input
                        id={`note-${line.productId}`}
                        value={line.note}
                        onChange={(e) => updateSample(line.productId, { note: e.target.value })}
                        placeholder="e.g. checking torque with foam liner"
                        className="mt-1 rounded-sm bg-card"
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div>
                      <Label
                        htmlFor={`qty-${line.productId}`}
                        className="label-caps text-muted-foreground"
                      >
                        Qty (max {SAMPLE_MAX_QTY})
                      </Label>
                      <Input
                        id={`qty-${line.productId}`}
                        type="number"
                        min={1}
                        max={SAMPLE_MAX_QTY}
                        value={line.qty}
                        onChange={(e) =>
                          updateSample(line.productId, {
                            qty: wholeQty(e.target.value, 1, SAMPLE_MAX_QTY),
                          })
                        }
                        className="tabular mt-1 w-24 rounded-sm bg-card"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-6"
                      onClick={() => removeSample(line.productId)}
                      aria-label={`Remove ${line.code}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form onSubmit={submit} className="panel h-fit min-w-0 p-5 lg:sticky lg:top-[73px]">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Where should samples go?</h2>
            <Button
              type="button"
              variant="rail"
              size="sm"
              onClick={() => {
                setForm(DEMO_DETAILS);
                toast.info("Demo details filled in", {
                  description: "Fictional contact using an example.com address.",
                });
              }}
            >
              <Wand2 className="size-3.5" /> Use demo details
            </Button>
          </div>
          <p className="spec-note mt-1">Prototype form — nothing is submitted or stored remotely.</p>

          <div className="mt-5 space-y-4">
            {(
              [
                ["company", "Company", "Meridian Labs"],
                ["name", "Contact name", "Dana Whitfield"],
                ["email", "Email", "you@company.com"],
                ["phone", "Phone", "(555) 010-2200"],
              ] as const
            ).map(([key, label, placeholder]) => (
              <div key={key}>
                <Label htmlFor={key} className="label-caps text-muted-foreground">
                  {label}
                </Label>
                <Input
                  id={key}
                  required
                  type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                  autoComplete={
                    key === "company"
                      ? "organization"
                      : key === "name"
                        ? "name"
                        : key === "email"
                          ? "email"
                          : "tel"
                  }
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="mt-1 rounded-sm"
                />
              </div>
            ))}
            <div>
              <Label htmlFor="address" className="label-caps text-muted-foreground">
                Shipping address
              </Label>
              <Textarea
                id="address"
                required
                rows={3}
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="mt-1 rounded-sm"
              />
            </div>

            <fieldset>
              <legend className="label-caps text-muted-foreground">Ship method</legend>
              <RadioGroup
                value={shipping}
                onValueChange={(v) => setShipping(v as Shipping)}
                className="mt-2 space-y-2"
              >
                <label className="flex cursor-pointer gap-3 border border-border p-3 text-sm has-[:checked]:border-primary">
                  <RadioGroupItem value="ground-complimentary" className="mt-0.5" />
                  <span>
                    <span className="block font-medium">Complimentary ground</span>
                    <span className="spec-note">Within North America</span>
                  </span>
                </label>
                <label className="flex cursor-pointer gap-3 border border-border p-3 text-sm has-[:checked]:border-primary">
                  <RadioGroupItem value="customer-carrier-account" className="mt-0.5" />
                  <span>
                    <span className="block font-medium">Expedited on your carrier account</span>
                    <span className="spec-note">Billed to your UPS or FedEx account</span>
                  </span>
                </label>
              </RadioGroup>
              {shipping === "customer-carrier-account" && (
                <div className="mt-3">
                  <Label htmlFor="carrier" className="label-caps text-muted-foreground">
                    UPS / FedEx account number
                  </Label>
                  <Input
                    id="carrier"
                    required
                    value={carrierAccount}
                    onChange={(e) => setCarrierAccount(e.target.value)}
                    className="mt-1 rounded-sm"
                  />
                </div>
              )}
            </fieldset>

            <div>
              <Label htmlFor="notes" className="label-caps text-muted-foreground">
                What are you trying to confirm?
              </Label>
              <Textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Fill volume, closure torque, label panel…"
                className="mt-1 rounded-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="accent"
            className="mt-5 w-full"
            disabled={samples.length === 0 || submitting}
          >
            {submitting ? "Recording demo request…" : "Submit sample request"}
          </Button>
          {samples.length === 0 && (
            <p className="spec-note mt-2">Add at least one item to submit.</p>
          )}
          <p className="mt-3">
            <DemoTag tone="neutral">Prototype · no data transmitted</DemoTag>
          </p>
        </form>
      </div>
    </div>
  );
}
