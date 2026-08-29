import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DemoTag } from "@/components/site/DemoTag";
import { useDemo } from "@/lib/demo-store";
import { services } from "@/lib/adapters/mock";
import type { SampleRequestResult } from "@/lib/adapters/types";

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
    ],
  }),
  component: Samples,
});

function Samples() {
  const { samples, updateSample, removeSample, clearSamples } = useDemo();
  const [shipping, setShipping] = useState<"ground-complimentary" | "customer-carrier-account">(
    "ground-complimentary",
  );
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
  const [result, setResult] = useState<SampleRequestResult | null>(null);

  const total = samples.reduce((n, l) => n + l.qty, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (samples.length === 0) return;
    setSubmitting(true);
    const res = await services.erp.submitSampleRequest({
      contact: {
        company: form.company,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      },
      shipping,
      carrierAccount: carrierAccount,
      items: samples.map((l) => ({
        productId: l.productId,
        code: l.code,
        qty: l.qty,
        note: l.note,
      })),
      notes: form.notes,
    });
    setSubmitting(false);
    setResult(res.data);
    toast.success(`Sample request ${res.data.reference} received`, {
      description: "Prototype confirmation — nothing was submitted or transmitted.",
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
            Sample request {result.reference} received.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This is a prototype confirmation screen. No request was submitted, no email was sent,
            and no data left this browser.
          </p>

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
              <Link to="/catalog">Back to catalog</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/integration">See the integration blueprint</Link>
            </Button>
            <Button
              variant="rail"
              onClick={() => {
                clearSamples();
                setResult(null);
              }}
            >
              Reset demo cart
            </Button>
          </div>
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
          Samples are available on request. Add the items you want to test, tell us where to send
          them, and note the fill or closure question you're trying to answer.
        </p>
      </div>

      <div data-demo-target="sample-cart" className="grid gap-10 pt-6 lg:grid-cols-[1fr_380px]">
        {/* Cart */}
        <section aria-labelledby="cart-heading" className="min-w-0">
          <div className="flex items-baseline justify-between">
            <h2 id="cart-heading" className="label-caps text-muted-foreground">
              Requested items ({total})
            </h2>
            {samples.length > 0 && (
              <button onClick={clearSamples} className="label-caps text-accent hover:underline">
                Empty cart
              </button>
            )}
          </div>

          {samples.length === 0 ? (
            <div className="mt-4 border border-dashed border-border p-10 text-center">
              <h3 className="font-display text-lg font-semibold">Nothing shortlisted yet</h3>
              <p className="measure mx-auto mt-2 text-sm text-muted-foreground">
                Add jars, closures, or discs from the catalog. Sample requests are the fastest way
                to confirm thread fit and fill volume.
              </p>
              <Button className="mt-5" asChild>
                <Link to="/catalog">Browse catalog</Link>
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
                        Qty
                      </Label>
                      <Input
                        id={`qty-${line.productId}`}
                        type="number"
                        min={1}
                        max={24}
                        value={line.qty}
                        onChange={(e) =>
                          updateSample(line.productId, {
                            qty: Math.max(1, Math.min(24, Number(e.target.value) || 1)),
                          })
                        }
                        className="tabular mt-1 w-20 rounded-sm bg-card"
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

        {/* Form */}
        <form onSubmit={submit} className="panel h-fit p-5 lg:sticky lg:top-[73px]">
          <h2 className="font-display text-lg font-semibold">Where should samples go?</h2>
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
                  type={key === "email" ? "email" : "text"}
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
                onValueChange={(v) => setShipping(v as typeof shipping)}
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
            {submitting ? "Submitting demo request…" : "Submit sample request"}
          </Button>
          <p className="mt-3">
            <DemoTag tone="neutral">Prototype · no data transmitted</DemoTag>
          </p>
        </form>
      </div>
    </div>
  );
}
