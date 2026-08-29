import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, PRODUCTS } from "@/data/products";
import { ProductSilhouette } from "@/components/site/ProductSilhouette";
import { DemoTag } from "@/components/site/DemoTag";
import heroImage from "@/assets/hero-jars.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Taral Direct — Plastic jars, closures & distributor portal" },
      {
        name: "description",
        content:
          "Find compatible plastic jars, lids, and closures by volume, neck finish, or item code, and request samples. Concept prototype for Taral Plastics.",
      },
      { property: "og:title", content: "Taral Direct — Packaging that fits the product" },
      {
        property: "og:description",
        content:
          "Specification-first packaging catalog and distributor self-service portal prototype for Taral Plastics.",
      },
    ],
  }),
  component: Home,
});

const NECKS = Array.from(
  new Set(PRODUCTS.map((p) => p.neck).filter((n): n is string => Boolean(n))),
).sort((a, b) => parseInt(a) - parseInt(b));

const VOLUMES = ["1/8 oz", "1/4 oz", "1/2 oz", "1 oz", "2 oz", "4 oz", "8 oz", "16 oz", "32 oz"];

const PATH = [
  {
    step: "01",
    label: "Find",
    text: "Search by fill volume, neck finish, or item code and compare specifications side by side.",
  },
  {
    step: "02",
    label: "Sample",
    text: "Request samples of the containers and closures you shortlisted. Samples are available on request.",
  },
  {
    step: "03",
    label: "Specify",
    text: "Confirm material, color, case count, and closure pairing before you commit to a run.",
  },
  {
    step: "04",
    label: "Order",
    text: "Stocked items generally ship within one business day; molded programs are scheduled.",
  },
];

function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [vol, setVol] = useState("any");
  const [neck, setNeck] = useState("any");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/catalog",
      search: {
        q: q || undefined,
        vol: vol === "any" ? undefined : vol,
        neck: neck === "any" ? undefined : neck,
      },
    });
  };

  return (
    <>
      {/* ── Hero: asymmetric product canvas ───────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1400px] gap-0 px-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="py-14 lg:py-20 lg:pr-14">
            <p className="label-caps text-muted-foreground">
              Taral Plastics · Manufacturing since 1962
            </p>
            <h1 className="mt-5 max-w-[22ch] font-display text-4xl leading-[1.03] font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Packaging that fits the product—and the business behind it.
            </h1>
            <p className="measure mt-6 text-base text-muted-foreground sm:text-lg">
              Regular, thick, and double wall jars with matching closures, discs, and dust covers.
              Search by specification, request samples, and — for distributors — see your own
              pricing, inventory, orders, and invoices in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/catalog">
                  Browse catalog <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/samples">Request samples</Link>
              </Button>
              <Button size="lg" variant="rail" asChild>
                <Link to="/portal">Distributor sign in</Link>
              </Button>
            </div>

            <dl className="mt-12 grid gap-6 border-t border-border pt-6 sm:grid-cols-3">
              {[
                ["60+ years", "Manufacturing experience"],
                ["1 business day", "Typical ship time on stocked items"],
                ["On request", "Samples for evaluation"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="label-caps text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-display text-xl font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="spec-note mt-3">Stated from Taral Plastics' current published site.</p>
          </div>

          <div className="relative border-border lg:border-l">
            <img
              src={heroImage}
              alt="Rows of white polypropylene jars with assorted screw closures on a concrete surface"
              width={1600}
              height={1200}
              className="h-64 w-full object-cover sm:h-80 lg:h-full"
            />
            <div className="absolute inset-x-0 bottom-0 border-t border-border bg-background/92 px-4 py-3 backdrop-blur-[2px]">
              <p className="spec-note">
                REF · 1/4-33-RW-WPPT — 33mm-400 · 2,000/case · max fill 14 ml
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Anchored specification inspector ──────────────────────────────── */}
      <section
        data-demo-target="finder"
        className="sticky top-[57px] z-30 border-b border-border bg-secondary"
      >
        <div className="mx-auto max-w-[1400px] px-4 py-5">
          <form onSubmit={submit} className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label htmlFor="finder-q" className="label-caps text-muted-foreground">
                Search volume, neck finish, item code, or category
              </label>
              <div className="mt-2 flex items-center gap-2 border border-input bg-card px-3">
                <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="finder-q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="e.g. 1/4-33-RW-WPPT, 33mm, double wall"
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:w-96">
              <div>
                <label className="label-caps text-muted-foreground" htmlFor="finder-vol">
                  Fill volume
                </label>
                <Select value={vol} onValueChange={setVol}>
                  <SelectTrigger id="finder-vol" className="mt-2 rounded-sm bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any volume</SelectItem>
                    {VOLUMES.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="label-caps text-muted-foreground" htmlFor="finder-neck">
                  Neck finish
                </label>
                <Select value={neck} onValueChange={setNeck}>
                  <SelectTrigger id="finder-neck" className="mt-2 rounded-sm bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any finish</SelectItem>
                    {NECKS.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" size="lg" variant="accent" className="lg:mb-px">
              Find containers
            </Button>
          </form>
        </div>
      </section>

      {/* ── Category rail ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 py-14">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl font-bold tracking-tight">Product families</h2>
          <Link to="/catalog" className="label-caps text-primary hover:underline">
            Open the workbench
          </Link>
        </div>
        <ul className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => {
            const count = PRODUCTS.filter((p) => p.category === category).length;
            return (
              <li key={category} className="bg-card">
                <Link
                  to="/catalog"
                  search={{ category }}
                  className="flex h-full items-center gap-4 p-5 transition-colors hover:bg-secondary"
                >
                  <ProductSilhouette
                    category={category}
                    className="size-12 shrink-0 text-primary"
                  />
                  <span className="min-w-0">
                    <span className="block font-display text-base font-semibold">{category}</span>
                    <span className="spec-note">
                      {count} demo item{count === 1 ? "" : "s"} in prototype
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── How Taral works ──────────────────────────────────────────────── */}
      <section className="border-y border-border bg-secondary">
        <div className="mx-auto max-w-[1400px] px-4 py-14">
          <h2 className="font-display text-2xl font-bold tracking-tight">How Taral works</h2>
          <ol className="mt-8 grid gap-px bg-border md:grid-cols-4">
            {PATH.map((item) => (
              <li key={item.step} className="bg-card p-5">
                <p className="spec-note text-accent">{item.step}</p>
                <h3 className="mt-2 font-display text-lg font-semibold">{item.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Distributor teaser ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 py-14">
        <div className="grid gap-8 border border-border p-6 lg:grid-cols-[1.3fr_1fr] lg:p-10">
          <div>
            <p className="label-caps text-muted-foreground">Distributor self-service</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
              Your pricing, your orders, your balance.
            </h2>
            <p className="measure mt-4 text-muted-foreground">
              The prototype portal shows what a distributor would see after signing in: a private
              price book with effective dates, available-to-sell by warehouse, order status, and
              invoices with a payment path. No live systems are connected — every figure is demo
              data.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/portal">Enter the demo portal</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/integration">See the integration blueprint</Link>
              </Button>
            </div>
          </div>
          <dl className="grid gap-px self-start bg-border">
            {[
              ["Open orders", "3"],
              ["Open invoices", "$18,420"],
              ["Next payment due", "September 15, 2026"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 bg-card p-4">
                <dt className="label-caps text-muted-foreground">{label}</dt>
                <dd className="tabular font-display text-lg font-semibold">{value}</dd>
              </div>
            ))}
            <div className="bg-card p-4">
              <DemoTag>Demo data · Meridian Labs sample account</DemoTag>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
