import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/data/products";
import { useCategoryImage } from "@/lib/site-images";
import { ProductSilhouette } from "@/components/site/ProductSilhouette";
import type { Category } from "@/data/products";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Taral Plastics — packaging manufacturing since the 1960s" },
      {
        name: "description",
        content:
          "Taral Plastics molds plastic jars, closures, discs, dust covers and add-ons, with more than 60 years of production experience.",
      },
      { property: "og:title", content: "About Taral Plastics" },
      {
        property: "og:description",
        content:
          "A packaging manufacturer with more than 60 years of experience molding jars and closures.",
      },
    ],
  }),
  component: About,
});

function Photo({ category }: { category: Category }) {
  const src = useCategoryImage(category);
  if (!src) return <ProductSilhouette category={category} className="size-20 text-primary" />;
  return (
    <img
      src={src}
      alt={`${category} molded by Taral Plastics`}
      loading="lazy"
      className="h-24 w-full object-contain"
    />
  );
}

function About() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12">
      <div className="max-w-3xl">
        <p className="label-caps text-muted-foreground">About</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          We mold to you.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Taral Plastics manufactures plastic packaging: regular, thick, and double wall jars, the
          closures that seal them, and the discs, dust covers, and add-ons that finish them. We have
          more than 60 years of production experience.
        </p>
        <p className="mt-4 text-muted-foreground">
          Most of what customers need from us is practical: does this closure fit this jar, will this
          jar hold that fill, how quickly can we get it, and what does it cost at our volume. That is
          what this site is built around — specifications you can compare, samples you can test, and
          an account service where your own pricing and orders live.
        </p>
      </div>

      <section aria-labelledby="what-we-make" className="mt-14">
        <h2 id="what-we-make" className="font-display text-2xl font-bold tracking-tight">
          What we make
        </h2>
        <ul className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <li key={category} className="bg-card p-5">
              <Photo category={category} />
              <h3 className="mt-3 font-display text-base font-semibold">{category}</h3>
              <Link
                to="/catalog"
                search={{ category }}
                className="label-caps mt-2 inline-block text-primary hover:underline"
              >
                See the range
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-we-work" className="mt-14 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 id="how-we-work" className="font-display text-2xl font-bold tracking-tight">
            How we work with customers
          </h2>
          <dl className="mt-5 divide-y divide-border border-y border-border">
            {[
              [
                "Specification first",
                "Fill volume, neck finish, wall style, material, and case count decide the fit. We would rather answer those questions before an order than after one.",
              ],
              [
                "Samples before commitments",
                "Sample quantities are for evaluation. Ask for the jar and the closure together so thread fit and torque can be checked on your line.",
              ],
              [
                "Distributors and direct customers",
                "Contract pricing, quantity breaks, and terms are set with your account, and shown to your team when they sign in.",
              ],
              [
                "Manufacturing, not just fulfillment",
                "Stock programs and molded programs are scheduled differently, and we will tell you which one you are in.",
              ],
            ].map(([term, text]) => (
              <div key={term} className="py-4">
                <dt className="label-caps text-foreground">{term}</dt>
                <dd className="measure mt-1 text-sm text-muted-foreground">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="panel h-fit p-6">
          <h2 className="font-display text-lg font-semibold">Talk to us</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Customer service can confirm a closure match, a case count, or a lead time faster than a
            catalog can.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Button asChild>
              <Link to="/contact">Contact customer service</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/samples">Request samples</Link>
            </Button>
            <Button variant="rail" asChild>
              <Link to="/faq">Read the FAQ</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
