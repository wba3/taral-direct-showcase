import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { money, type Product } from "@/data/products";
import { ProductSilhouette } from "@/components/site/ProductSilhouette";
import { DemoTag } from "@/components/site/DemoTag";
import { cn } from "@/lib/utils";
import { inventoryFor, orderMinimumFor, resolvePrice } from "@/data/portal";
import { useDemo } from "@/lib/demo-store";
import { useProductImage } from "@/lib/site-images";

/** Real photo harvested from taralplastics.com, with silhouette fallback. */
function ProductThumb({
  product,
  className,
  silhouetteClassName,
}: {
  product: Product;
  className: string;
  silhouetteClassName: string;
}) {
  const src = useProductImage(product);
  if (!src) {
    return (
      <ProductSilhouette
        category={product.category}
        label={product.name}
        className={silhouetteClassName}
      />
    );
  }
  return (
    <img
      src={src}
      alt={`${product.name} — photograph from taralplastics.com`}
      loading="lazy"
      className={cn("object-contain", className)}
    />
  );
}

/** Labels whether the thumbnail is a real source photo or a drawn stand-in. */
function ProvenanceTag({ product }: { product: Product }) {
  const src = useProductImage(product);
  return (
    <DemoTag tone={src ? "neutral" : "illustrative"}>
      {src ? "From taralplastics.com" : "Illustrative"}
    </DemoTag>
  );
}

function StockMark({ product, mode }: { product: Product; mode: "public" | "portal" }) {
  const { simulateStaleInventory } = useDemo();
  const snapshot = inventoryFor(product.id);
  const label =
    mode === "public"
      ? "Contact for availability"
      : !snapshot
        ? "Availability unconfirmed"
        : simulateStaleInventory || snapshot.state === "Stale"
          ? "Stale demo snapshot"
          : snapshot.state === "Unavailable" || snapshot.availableCases === 0
            ? "Unavailable"
            : `${snapshot.availableCases} cases · demo stock`;
  return <span className="label-caps text-muted-foreground">{label}</span>;
}

export function PriceState({ product, mode }: { product: Product; mode: "public" | "portal" }) {
  const { accountId } = useDemo();
  if (mode === "public")
    return (
      <div>
        <p className="label-caps text-muted-foreground">Account pricing</p>
        <Link to="/portal" className="text-sm underline underline-offset-4">
          Sign in for account pricing
        </Link>
      </div>
    );
  const minimum = orderMinimumFor(accountId, product.id);
  const row = resolvePrice(accountId, product.id, minimum);
  if (!row)
    return (
      <div>
        <p className="label-caps text-muted-foreground">Request quote</p>
        <p className="spec-note">No current price for this demo account</p>
      </div>
    );
  return (
    <div>
      <p className="label-caps text-muted-foreground">Your demo price</p>
      <p className="tabular font-display text-lg font-semibold">
        {money(row.currentPrice, 3)}
        <span className="spec-note"> / item</span>
      </p>
      <p className="spec-note">
        {money(row.currentPrice * product.caseCount, 2)} / case · {minimum}+ cases
      </p>
      <DemoTag tone="illustrative" className="mt-1" />
    </div>
  );
}

export function ProductCard({
  product,
  view,
  mode = "public",
  action,
}: {
  product: Product;
  view: "grid" | "list";
  mode?: "public" | "portal";
  action?: React.ReactNode;
}) {
  const specs = (
    <dl className="spec-note grid grid-cols-2 gap-x-4 gap-y-1">
      <div className="flex gap-1.5">
        <dt className="text-muted-foreground">SIZE</dt>
        <dd className="text-foreground">{product.size}</dd>
      </div>
      <div className="flex gap-1.5">
        <dt className="text-muted-foreground">NECK</dt>
        <dd className="text-foreground">{product.neck ?? "—"}</dd>
      </div>
      <div className="flex gap-1.5">
        <dt className="text-muted-foreground">CASE</dt>
        <dd className="text-foreground">{product.caseCount.toLocaleString()}</dd>
      </div>
      <div className="flex gap-1.5">
        <dt className="text-muted-foreground">COLOR</dt>
        <dd className="truncate text-foreground">{product.color}</dd>
      </div>
    </dl>
  );

  if (view === "list") {
    return (
      <article className="panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4 sm:w-72">
          <ProductThumb
            product={product}
            className="size-14 shrink-0"
            silhouetteClassName="size-14 shrink-0 text-primary"
          />
          <div className="min-w-0">
            <p className="spec-note text-foreground">{product.code}</p>
            <h3 className="truncate text-sm font-semibold">{product.name}</h3>
            <StockMark product={product} />
          </div>
        </div>
        <div className="flex-1">{specs}</div>
        <div className="sm:w-52">
          <PriceState product={product} mode={mode} />
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:w-44">
          {action}
          <Link
            to="/product/$id"
            params={{ id: product.id }}
            className="label-caps inline-flex items-center gap-1 text-primary hover:underline"
          >
            Specification <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="panel group flex flex-col">
      <div className="rule-grid relative flex items-center justify-center border-b border-border py-8">
        <ProductThumb
          product={product}
          className="size-28"
          silhouetteClassName="size-28 text-primary"
        />
        <span className="absolute bottom-2 left-2">
          <ProvenanceTag product={product} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="spec-note text-foreground">{product.code}</p>
          <h3 className="mt-0.5 font-display text-base leading-tight font-semibold">
            {product.name}
          </h3>
          <div className="mt-1">
            <StockMark product={product} />
          </div>
        </div>
        {specs}
        <div className="mt-auto border-t border-border pt-3">
          <PriceState product={product} mode={mode} />
        </div>
        <div className="flex flex-col gap-2">
          {action}
          <Link
            to="/product/$id"
            params={{ id: product.id }}
            className="label-caps inline-flex items-center gap-1 text-primary hover:underline"
          >
            Specification <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
