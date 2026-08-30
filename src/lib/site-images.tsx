import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { getSiteAssetIndex, type SiteAssetIndex } from "@/lib/site-assets.functions";
import type { Category, Product } from "@/data/products";

/**
 * Real imagery harvested from the public taralplastics.com site, stored in the
 * backend. Everything here is genuine site content — pricing, inventory and
 * order data elsewhere in the prototype remain demo values.
 */

interface Resolved {
  /** Item photo by demo product id. */
  byProduct: Map<string, string>;
  /** Category tile photo. */
  byCategory: Map<string, string>;
  logo: string | null;
  count: number;
  loading: boolean;
}

const EMPTY: Resolved = {
  byProduct: new Map(),
  byCategory: new Map(),
  logo: null,
  count: 0,
  loading: true,
};

const SiteImageContext = createContext<Resolved>(EMPTY);

const CATEGORY_TILE: Record<string, Category> = {
  reg: "Regular Wall Jars",
  thick: "Thick Wall Jars",
  dbl: "Double Wall Jars",
  closures: "Lids & Closures",
  dust: "Discs & Dust Covers",
  misc: "Add-ons",
};

function normalize(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function resolve(index: SiteAssetIndex | undefined, products: Product[]): Resolved {
  if (!index) return EMPTY;

  const urlFor = new Map(index.assets.map((asset) => [asset.sourceUrl, asset.publicUrl]));

  const byCategory = new Map<string, string>();
  for (const asset of index.assets) {
    if (asset.kind !== "category") continue;
    const slug = asset.sourceUrl.split("/").pop()?.replace(/\.[a-z]+$/i, "") ?? "";
    const category = CATEGORY_TILE[slug];
    if (category) byCategory.set(category, asset.publicUrl);
  }

  const byProduct = new Map<string, string>();
  for (const product of products) {
    const candidates = index.products.filter((row) => row.category === product.category);
    const exact = candidates.find(
      (row) =>
        normalize(row.volume) === normalize(product.size) &&
        normalize(row.diameter) === normalize(product.neck),
    );
    const byNeck =
      product.neck !== null
        ? candidates.find((row) => normalize(row.diameter) === normalize(product.neck))
        : undefined;
    const byVolume = candidates.find((row) => normalize(row.volume) === normalize(product.size));
    const match = exact ?? byNeck ?? byVolume;
    const url = match?.sourceImageUrl ? urlFor.get(match.sourceImageUrl) : undefined;
    if (url) byProduct.set(product.id, url);
  }

  const logo = index.assets.find((asset) => asset.kind === "logo")?.publicUrl ?? null;

  return { byProduct, byCategory, logo, count: index.assets.length, loading: false };
}

export function SiteImageProvider({
  children,
  products,
}: {
  children: ReactNode;
  products: Product[];
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["site-asset-index"],
    queryFn: () => getSiteAssetIndex(),
    staleTime: 5 * 60 * 1000,
  });

  const value = useMemo(() => {
    const resolved = resolve(data, products);
    return { ...resolved, loading: isLoading };
  }, [data, products, isLoading]);

  return <SiteImageContext.Provider value={value}>{children}</SiteImageContext.Provider>;
}

export function useSiteImages() {
  return useContext(SiteImageContext);
}

export function useProductImage(product: Product): string | null {
  const { byProduct, byCategory } = useSiteImages();
  return byProduct.get(product.id) ?? byCategory.get(product.category) ?? null;
}

export function useCategoryImage(category: Category): string | null {
  return useSiteImages().byCategory.get(category) ?? null;
}
