import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DemoTag } from "@/components/site/DemoTag";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Taral Plastics — customer service and account questions" },
      {
        name: "description",
        content:
          "Reach Taral Plastics customer service about closure matching, case quantities, lead times, samples, or opening an account.",
      },
      { property: "og:title", content: "Contact Taral Plastics" },
      {
        property: "og:description",
        content: "Questions about jars, closures, samples, pricing, or account access.",
      },
    ],
  }),
  component: Contact,
});

const TOPICS = [
  "Product or closure match",
  "Samples",
  "Pricing or an account",
  "Order or invoice",
  "Something else",
];

function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    topic: TOPICS[0]!,
    message: "",
  });

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12">
      <div className="max-w-3xl">
        <p className="label-caps text-muted-foreground">Contact</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
          Tell us what you are packaging.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Customer service handles closure matching, case quantities, lead times, samples, and
          account setup.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <section aria-labelledby="form-heading" className="min-w-0">
          <h2 id="form-heading" className="label-caps text-muted-foreground">
            Send a message
          </h2>

          {sent ? (
            <div className="panel mt-4 p-6">
              <h3 className="font-display text-xl font-semibold">Message captured in the demo</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                In the live site this reaches customer service. In this prototype nothing was sent —
                the message stayed in this browser window and no email was transmitted.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setSent(false)}>
                  Write another
                </Button>
                <Button variant="rail" asChild>
                  <Link to="/samples">Request samples instead</Link>
                </Button>
              </div>
              <p className="mt-4">
                <DemoTag tone="neutral">Nothing transmitted</DemoTag>
              </p>
            </div>
          ) : (
            <form
              className="mt-4 grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              {(
                [
                  ["company", "Company", "text"],
                  ["name", "Your name", "text"],
                  ["email", "Email", "email"],
                  ["phone", "Phone", "tel"],
                ] as const
              ).map(([key, label, type]) => (
                <div key={key}>
                  <Label htmlFor={`c-${key}`} className="label-caps text-muted-foreground">
                    {label}
                  </Label>
                  <Input
                    id={`c-${key}`}
                    type={type}
                    required
                    autoComplete={key === "company" ? "organization" : key}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="mt-1 rounded-sm"
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <Label htmlFor="c-topic" className="label-caps text-muted-foreground">
                  What is this about?
                </Label>
                <select
                  id="c-topic"
                  value={form.topic}
                  onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                  className="mt-1 h-10 w-full rounded-sm border border-input bg-card px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="c-message" className="label-caps text-muted-foreground">
                  Message
                </Label>
                <Textarea
                  id="c-message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Fill volume, closure question, quantities, timing…"
                  className="mt-1 rounded-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" variant="accent">
                  Send message
                </Button>
                <p className="mt-3">
                  <DemoTag tone="neutral">
                    Prototype form · nothing is emailed or transmitted
                  </DemoTag>
                </p>
              </div>
            </form>
          )}
        </section>

        <aside aria-labelledby="direct-heading" className="panel h-fit p-6">
          <h2 id="direct-heading" className="font-display text-lg font-semibold">
            Direct lines
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Mail className="size-4 text-primary" aria-hidden="true" />
              <a className="hover:underline" href="mailto:sales@taralplastics.com">
                sales@taralplastics.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-4 text-primary" aria-hidden="true" />
              <a className="hover:underline" href="tel:+15109726300">
                (510) 972-6300
              </a>
            </li>
          </ul>
          <p className="mt-5 text-sm text-muted-foreground">
            Already have an account? Sign in to see your pricing, orders, and invoices.
          </p>
          <Button variant="outline" className="mt-4 w-full" asChild>
            <Link to="/portal">Account access</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
