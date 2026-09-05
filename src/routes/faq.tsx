import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ACCOUNT } from "@/data/portal";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — samples, case quantities, closures and accounts | Taral Plastics" },
      {
        name: "description",
        content:
          "Answers about sample quantities, whole-case minimums, closure and thread matching, lead times, pricing, and account access at Taral Plastics.",
      },
      { property: "og:title", content: "Taral Plastics FAQ" },
      {
        property: "og:description",
        content: "Samples, case quantities, closure matching, lead times, and account access.",
      },
    ],
  }),
  component: Faq;
});

const GROUPS = [
  {
    heading: "Samples",
    items: [
      [
        "How many samples can I request?",
        "Sample quantities are small — a handful of each item, enough to test fit, fill, and torque. In this prototype the basket allows up to 12 pieces per item. Sample quantities are separate from the whole-case minimums that apply to merchandise orders.",
      ],
      [
        "Is there a charge for samples?",
        "Samples are supplied for evaluation. Expedited shipping can be billed to your own carrier account if you need it faster.",
      ],
      [
        "Should I ask for the jar and the closure together?",
        "Yes. Thread fit and sealing are the two things a sample answers best, and both need the pair.",
      ],
    ],
  },
  {
    heading: "Ordering",
    items: [
      [
        "Do you sell partial cases?",
        `Merchandise ships in whole cases. Each account has its own case minimum — the demo account shown in this prototype has a ${ACCOUNT.caseMinimum}-case minimum per line and a small-order handling charge under five cases.`,
      ],
      [
        "How do I know a closure fits a jar?",
        "Match the full neck finish, not just the diameter. A 53mm-400 closure and a 53mm-425 closure share a diameter but not a thread, so they are not interchangeable. Product pages list the finish; customer service will confirm a pairing.",
      ],
      [
        "What are lead times?",
        "Stock programs and molded programs are scheduled differently. Customer service confirms the current lead time for your item and quantity.",
      ],
    ],
  },
  {
    heading: "Pricing and accounts",
    items: [
      [
        "Where do I see my price?",
        "Contract pricing lives in your account. Sign in and open the price book to see your current price, quantity breaks, and any announced change with its effective date. Announced changes do not apply before their date.",
      ],
      [
        "Are prices published on the site?",
        "Published list pricing appears where Taral publishes it. Where it does not, the product page asks you to request details rather than showing an invented number.",
      ],
      [
        "How do I pay an invoice?",
        "Invoices, terms, and early-payment discount deadlines appear in your account. Taral's business system remains the record for what is owed and what has been applied.",
      ],
      [
        "Where is the pricing policy?",
        "Current published pricing and terms remain on taralplastics.com.",
      ],
    ],
  },
];

function Faq() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12">
      <div className="max-w-3xl">
        <p className="label-caps text-muted-foreground">FAQ</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
          Questions we answer every week.
        </h1>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-12">
          {GROUPS.map((group) => (
            <section key={group.heading} aria-labelledby={`faq-${group.heading}`}>
              <h2
                id={`faq-${group.heading}`}
                className="font-display text-2xl font-bold tracking-tight"
              >
                {group.heading}
              </h2>
              <dl className="mt-4 divide-y divide-border border-y border-border">
                {group.items.map(([q, a]) => (
                  <div key={q} className="py-4">
                    <dt className="font-display text-base font-semibold">{q}</dt>
                    <dd className="measure mt-2 text-sm text-muted-foreground">{a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <aside className="panel h-fit p-6">
          <h2 className="font-display text-lg font-semibold">Still unsure?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Send the fill, the finish, and the quantity, and customer service will come back with the
            fit.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Button asChild>
              <Link to="/contact">Contact customer service</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/samples">Request samples</Link>
            </Button>
            <Button variant="rail" asChild>
              <a href="https://taralplastics.com/" rel="noreferrer" target="_blank">
                Pricing and terms on taralplastics.com
              </a>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
