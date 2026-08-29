import type { Category } from "@/data/products";

/**
 * Technical container silhouettes drawn as linework — no stock imagery,
 * no fake photography. Proportions shift by product family.
 */
export function ProductSilhouette({
  category,
  label,
  className,
}: {
  category: Category;
  label?: string;
  className?: string;
}) {
  const wall =
    category === "Double Wall Jars" ? 2 : category === "Thick Wall Jars" ? 1.4 : 0.8;

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={label ? `${label} technical silhouette` : `${category} silhouette`}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      >
        <line x1="10" y1="106" x2="110" y2="106" strokeDasharray="2 3" opacity="0.5" />
        {category === "Lids & Closures" ? (
          <>
            <path d="M32 62 h56 v22 a6 6 0 0 1 -6 6 h-44 a6 6 0 0 1 -6 -6 z" />
            <path d="M32 62 q28 -12 56 0" />
            {Array.from({ length: 11 }).map((_, i) => (
              <line key={i} x1={35 + i * 5} y1="68" x2={35 + i * 5} y2="88" opacity="0.45" />
            ))}
          </>
        ) : category === "Discs & Dust Covers" ? (
          <>
            <ellipse cx="60" cy="74" rx="34" ry="10" />
            <ellipse cx="60" cy="74" rx="26" ry="7" opacity="0.55" />
            <path d="M26 74 v6 a34 10 0 0 0 68 0 v-6" />
          </>
        ) : category === "Add-ons" ? (
          <>
            <rect x="34" y="34" width="52" height="56" rx="1" strokeDasharray="4 3" />
            <line x1="34" y1="52" x2="86" y2="52" opacity="0.5" />
            <line x1="46" y1="66" x2="74" y2="66" opacity="0.5" />
            <line x1="46" y1="76" x2="64" y2="76" opacity="0.5" />
          </>
        ) : (
          <>
            {/* neck + thread */}
            <path d="M44 22 h32 v12 h-32 z" />
            <line x1="44" y1="26" x2="76" y2="26" opacity="0.5" />
            <line x1="44" y1="30" x2="76" y2="30" opacity="0.5" />
            {/* body */}
            <path d="M40 34 h40 v52 a6 6 0 0 1 -6 6 h-28 a6 6 0 0 1 -6 -6 z" />
            {/* wall thickness notation */}
            <path
              d={`M${40 + wall * 2} 36 v50`}
              opacity="0.55"
              strokeDasharray={category === "Double Wall Jars" ? "3 2" : undefined}
            />
            <path d={`M${80 - wall * 2} 36 v50`} opacity="0.55" />
            {/* fill line */}
            <line x1="44" y1="46" x2="76" y2="46" strokeDasharray="2 3" opacity="0.6" />
          </>
        )}
      </g>
    </svg>
  );
}
