import { useMemo } from "react";
import { CATEGORIES, type Product } from "@/data/products";

export interface FilterState {
  q: string;
  category: string;
  volume: string;
  neck: string;
  color: string;
  stock: string;
}

export function useCatalogFilter(products: Product[], f: FilterState) {
  return useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return products.filter((p) => {
      if (f.category !== "any" && p.category !== f.category) return false;
      if (f.volume !== "any" && p.size !== f.volume) return false;
      if (f.neck !== "any" && p.neck !== f.neck) return false;
      if (f.color !== "any" && p.color !== f.color) return false;
      if (f.stock !== "any" && p.stock !== f.stock) return false;
      if (!q) return true;
      return [p.code, p.name, p.category, p.size, p.neck ?? "", p.material, p.color]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [products, f]);
}

function Group({
  legend,
  name,
  options,
  value,
  onChange,
  counts,
}: {
  legend: string;
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  counts?: Record<string, number>;
}) {
  return (
    <fieldset className="border-b border-border pb-4">
      <legend className="label-caps text-muted-foreground">{legend}</legend>
      <div className="mt-3 space-y-1.5">
        {["any", ...options].map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2 text-sm has-checked:text-foreground"
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="size-3.5 accent-[var(--steel)]"
            />
            <span className={value === option ? "font-medium" : "text-muted-foreground"}>
              {option === "any" ? `All ${legend.toLowerCase()}` : option}
            </span>
            {counts && option !== "any" && (
              <span className="spec-note ml-auto">{counts[option] ?? 0}</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CatalogFilters({
  filters,
  onChange,
  products,
}: {
  filters: FilterState;
  onChange: (updater: (f: FilterState) => FilterState) => void;
  products: Product[];
}) {
  const volumes = Array.from(new Set(products.map((p) => p.size)));
  const necks = Array.from(
    new Set(products.map((p) => p.neck).filter((n): n is string => Boolean(n))),
  ).sort((a, b) => parseInt(a) - parseInt(b));
  const colors = Array.from(new Set(products.map((p) => p.color)));
  const counts = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <aside aria-label="Filters" className="lg:sticky lg:top-[73px] lg:self-start">
      <details open className="lg:open:block">
        <summary className="label-caps cursor-pointer border-b border-border pb-3 lg:pointer-events-none lg:list-none">
          Refine specification
        </summary>
        <div className="mt-4 space-y-4">
          <Group
            legend="Category"
            name="f-category"
            options={CATEGORIES}
            counts={counts}
            value={filters.category}
            onChange={(v) => onChange((f) => ({ ...f, category: v }))}
          />
          <Group
            legend="Fill volume"
            name="f-volume"
            options={volumes}
            value={filters.volume}
            onChange={(v) => onChange((f) => ({ ...f, volume: v }))}
          />
          <Group
            legend="Neck finish"
            name="f-neck"
            options={necks}
            value={filters.neck}
            onChange={(v) => onChange((f) => ({ ...f, neck: v }))}
          />
          <Group
            legend="Color / material"
            name="f-color"
            options={colors}
            value={filters.color}
            onChange={(v) => onChange((f) => ({ ...f, color: v }))}
          />
          <Group
            legend="Stocking status"
            name="f-stock"
            options={["In stock", "Low stock", "Made to order"]}
            value={filters.stock}
            onChange={(v) => onChange((f) => ({ ...f, stock: v }))}
          />
        </div>
      </details>
    </aside>
  );
}
