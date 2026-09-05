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
import { useCategoryImage } from "@/lib/site-images";
import type { Category } from "@/data/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Taral Plastics — plastic jars, closures and packaging built to your fill" },
      {
        name: "description",
        content:
          "Regular, thick and double wall plastic jars with matching closures, discs and add-ons. Search by fill volume or neck finish, request samples, and manage your account online.",
      },
      { property: "og:title", content: "Taral Plastics — We mold to you." },
      {
        property: "og:description",
        content:
          "Plastic jars, closures, discs and add-ons from a manufacturer with more than 60 years of production experience.",
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
    label: "Find the fit",
    text: "Search by fill volume, neck finish, or item code and compare specifications side by side.",
  },
  {
    step: "02",
    label: "Test it",
    text: "Request samples of the containers and closures you shortlisted before committing a line.",
  },
  {
    step: "03",
    label: "Specify",
    text: "Confirm material, color, case count, and closure pairing with customer service.",
  },
  {
    step: "04",
    label: "Order and reorder",
    text: "Account holders see their own pricing, order history, and invoices in one place.",
  },
];

/** Real category photograph from taralplastics.com, with a drawn stand-in. */
function CategoryImage({ category, className }: { category: Category; className: string }) {
  const src = useCategoryImage(category);
  if (!src) {
    return <ProductSilhouette category={category} className={`${className} text-primary`} />;
  }
  return (
    <img
      src={src}
      alt={`${category} manufactured by Taral Plastics`}
      loading="lazy"
      className={`${className} object-contain`}
    />
  );
}

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
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1400px] gap-0 px-4 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div className="py-14 lg:py-20 lg:pr-14">
            <p className="label-caps text-muted-foreground">
              Taral Plastics · Packaging manufacturer
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[1.02] font-bold tracking-tight sm:text-6xl lg:text-7xl">
              We mold to you.
            </h1>
            <p className="measure mt-6 text-base text-muted-foreground sm:text-lg">
              Regular, thick, and double wall jars with matching closures, discs, dust covers, and
              add-ons. Tell us the fill and the finish, and we will help you land on the right
              container.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/catalog">
                  Browse products <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/samples">Request samples</Link>
              </Button>
            </div>

            <dl className="mt-12 grid gap-6 border-t border-border pt-6 sm:grid-cols-3">
              {[
                ["60+ years", "Manufacturing experience"],
                ["Six families", "Jars, closures, discs, covers, add-ons"],
                ["On request", "Samples for evaluation"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="label-caps text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-display text-xl font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-px self-center bg-border lg:border-l lg:border-border">
            {CATEGORIES.slice(0, 4).map((category) => (
              <figure key={category} className="bg-card p-6">
                <CategoryImage category={category} className="mx-auto h-28 w-full sm:h-36" />
                <figcaption className="spec-note mt-3 text-center">{category}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Specification finder ──────────────────────────────────────────── */}
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

      {/* ── Product families ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 py-14">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl font-bold tracking-tight">Product families</h2>
          <Link to="/catalog" className="label-caps text-primary hover:underline">
            See all products
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
                  <CategoryImage category={category} className="size-16 shrink-0" />
                  <span className="min-w-0">
                    <span className="block font-display text-base font-semibold">{category}</span>
                    <span className="spec-note">
                      {count} item{count === 1 ? "" : "s"} listed
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── How working with Taral goes ──────────────────────────────────── */}
      <section className="border-y border-border bg-secondary">
        <div className="mx-auto max-w-[1400px] px-4 py-14">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            How working with Taral goes
          </h2>
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

      {/* ── Account service ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 py-14">
        <div className="grid gap-8 border border-border p-6 lg:grid-cols-[1.3fr_1fr] lg:p-10">
          <div>
            <p className="label-caps text-muted-foreground">Taral Direct · account service</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
              Your pricing, your orders, your balance.
            </h2>
            <p className="measure mt-4 text-muted-foreground">
              Distributors and direct customers can sign in to see contract pricing with effective
              dates, availability, order status, and open invoices — instead of trading emails for
              them.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/portal">Account access</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/contact">Ask about an account</Link>
              </Button>
            </div>
          </div>
          <ul className="grid gap-px self-start bg-border">
            {[
              ["Contract pricing", "Your prices and announced changes with effective dates"],
              ["Orders", "Requested, shipped, and remaining quantities by line"],
              ["Invoices", "Open balance, discount deadlines, and payment"],
              ["Samples", "Track what you asked for and what shipped"],
            ].map(([label, text]) => (
              <li key={label} className="bg-card p-4">
                <p className="label-caps text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
