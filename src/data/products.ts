/**
 * Typed demo catalog for the Taral Direct prototype.
 *
 * `source: "current-site"` rows reproduce facts published on
 * taralplastics.com. Everything else is invented for demonstration and is
 * marked illustrative so it can never be mistaken for live ERP data.
 */

export type Category =
  | "Regular Wall Jars"
  | "Thick Wall Jars"
  | "Double Wall Jars"
  | "Lids & Closures"
  | "Discs & Dust Covers"
  | "Add-ons";

export type StockStatus = "In stock" | "Low stock" | "Made to order";

export interface Product {
  id: string;
  code: string;
  name: string;
  category: Category;
  /** Nominal fill volume label, e.g. "1/4 oz". */
  size: string;
  /** Numeric ounces for range filtering. */
  sizeOz: number;
  /** Neck finish, e.g. "33mm-400". Empty for non-threaded items. */
  neck: string | null;
  neckDiameterMm: number | null;
  material: string;
  color: string;
  caseCount: number;
  stock: StockStatus;
  overstock?: boolean;
  /** Public list price per item, when Taral publishes one. */
  publicUnitPrice: number | null;
  publicCasePrice: number | null;
  /** Distributor price for the Meridian Labs demo account. */
  demoUnitPrice: number | null;
  quantityBreaks?: { minCases: number; unitPrice: number }[];
  dims?: { height?: string; opening?: string; maxFill?: string };
  availableToSell?: number;
  warehouses?: { code: string; name: string; qty: number }[];
  source: "current-site" | "illustrative";
  notes?: string;
}

export const CATEGORIES: Category[] = [
  "Regular Wall Jars",
  "Thick Wall Jars",
  "Double Wall Jars",
  "Lids & Closures",
  "Discs & Dust Covers",
  "Add-ons",
];

export const PRODUCTS: Product[] = [
  {
    id: "quarter-33-rw-wppt",
    code: "1/4-33-RW-WPPT",
    name: "1/4 oz Regular Wall Jar",
    category: "Regular Wall Jars",
    size: "1/4 oz",
    sizeOz: 0.25,
    neck: "33mm-400",
    neckDiameterMm: 33,
    material: "White polypropylene #5 PP",
    color: "White",
    caseCount: 2000,
    stock: "In stock",
    overstock: true,
    publicUnitPrice: 0.07,
    publicCasePrice: 148,
    demoUnitPrice: 0.062,
    quantityBreaks: [
      { minCases: 1, unitPrice: 0.062 },
      { minCases: 5, unitPrice: 0.058 },
      { minCases: 20, unitPrice: 0.054 },
    ],
    dims: { height: "1.17 in", opening: "1.06 in", maxFill: "14 ml" },
    availableToSell: 96000,
    warehouses: [
      { code: "HAY", name: "Hayward, CA", qty: 74000 },
      { code: "OVR", name: "Overstock reserve", qty: 22000 },
    ],
    source: "current-site",
    notes: "Published on the current Taral Plastics site.",
  },
  {
    id: "eighth-29-rw-wppt",
    code: "1/8-29-RW-WPPT",
    name: "1/8 oz Regular Wall Jar",
    category: "Regular Wall Jars",
    size: "1/8 oz",
    sizeOz: 0.125,
    neck: "29mm-400",
    neckDiameterMm: 29,
    material: "White polypropylene #5 PP",
    color: "White",
    caseCount: 2400,
    stock: "In stock",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: 0.058,
    quantityBreaks: [
      { minCases: 1, unitPrice: 0.058 },
      { minCases: 10, unitPrice: 0.053 },
    ],
    dims: { height: "0.94 in", opening: "0.92 in", maxFill: "7 ml" },
    availableToSell: 52800,
    warehouses: [{ code: "HAY", name: "Hayward, CA", qty: 52800 }],
    source: "illustrative",
  },
  {
    id: "half-38-rw-clr",
    code: "1/2-38-RW-CPPT",
    name: "1/2 oz Regular Wall Jar",
    category: "Regular Wall Jars",
    size: "1/2 oz",
    sizeOz: 0.5,
    neck: "38mm-400",
    neckDiameterMm: 38,
    material: "Natural polypropylene #5 PP",
    color: "Natural / translucent",
    caseCount: 1600,
    stock: "In stock",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: 0.081,
    quantityBreaks: [
      { minCases: 1, unitPrice: 0.081 },
      { minCases: 8, unitPrice: 0.075 },
    ],
    dims: { height: "1.31 in", opening: "1.24 in", maxFill: "22 ml" },
    availableToSell: 27200,
    warehouses: [{ code: "HAY", name: "Hayward, CA", qty: 27200 }],
    source: "illustrative",
  },
  {
    id: "one-48-tw-wppt",
    code: "1-48-TW-WPPT",
    name: "1 oz Thick Wall Jar",
    category: "Thick Wall Jars",
    size: "1 oz",
    sizeOz: 1,
    neck: "48mm-400",
    neckDiameterMm: 48,
    material: "White polypropylene #5 PP",
    color: "White",
    caseCount: 1000,
    stock: "In stock",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: 0.184,
    quantityBreaks: [
      { minCases: 1, unitPrice: 0.184 },
      { minCases: 6, unitPrice: 0.171 },
      { minCases: 24, unitPrice: 0.163 },
    ],
    dims: { height: "1.62 in", opening: "1.58 in", maxFill: "34 ml" },
    availableToSell: 18000,
    warehouses: [
      { code: "HAY", name: "Hayward, CA", qty: 14000 },
      { code: "TX1", name: "Dallas, TX (3PL)", qty: 4000 },
    ],
    source: "illustrative",
  },
  {
    id: "two-53-tw-blk",
    code: "2-53-TW-BPPT",
    name: "2 oz Thick Wall Jar",
    category: "Thick Wall Jars",
    size: "2 oz",
    sizeOz: 2,
    neck: "53mm-400",
    neckDiameterMm: 53,
    material: "Black polypropylene #5 PP",
    color: "Black",
    caseCount: 720,
    stock: "Low stock",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: 0.268,
    quantityBreaks: [
      { minCases: 1, unitPrice: 0.268 },
      { minCases: 10, unitPrice: 0.249 },
    ],
    dims: { height: "1.85 in", opening: "1.73 in", maxFill: "62 ml" },
    availableToSell: 4320,
    warehouses: [{ code: "HAY", name: "Hayward, CA", qty: 4320 }],
    source: "illustrative",
  },
  {
    id: "four-70-dw-wppt",
    code: "4-70-DW-WPPT",
    name: "4 oz Double Wall Jar",
    category: "Double Wall Jars",
    size: "4 oz",
    sizeOz: 4,
    neck: "70mm-400",
    neckDiameterMm: 70,
    material: "White polypropylene #5 PP",
    color: "White",
    caseCount: 480,
    stock: "In stock",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: 0.612,
    quantityBreaks: [
      { minCases: 1, unitPrice: 0.612 },
      { minCases: 5, unitPrice: 0.579 },
      { minCases: 15, unitPrice: 0.548 },
    ],
    dims: { height: "2.28 in", opening: "2.31 in", maxFill: "126 ml" },
    availableToSell: 11040,
    warehouses: [{ code: "HAY", name: "Hayward, CA", qty: 11040 }],
    source: "illustrative",
  },
  {
    id: "eight-89-dw-clr",
    code: "8-89-DW-CPPT",
    name: "8 oz Double Wall Jar",
    category: "Double Wall Jars",
    size: "8 oz",
    sizeOz: 8,
    neck: "89mm-400",
    neckDiameterMm: 89,
    material: "Natural polypropylene #5 PP",
    color: "Natural / translucent",
    caseCount: 240,
    stock: "Made to order",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: null,
    dims: { height: "2.94 in", opening: "2.92 in", maxFill: "248 ml" },
    availableToSell: 0,
    warehouses: [],
    source: "illustrative",
    notes: "Molded to order — lead time quoted per run.",
  },
  {
    id: "sixteen-89-rw-wppt",
    code: "16-89-RW-WPPT",
    name: "16 oz Regular Wall Jar",
    category: "Regular Wall Jars",
    size: "16 oz",
    sizeOz: 16,
    neck: "89mm-400",
    neckDiameterMm: 89,
    material: "White polypropylene #5 PP",
    color: "White",
    caseCount: 180,
    stock: "In stock",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: 0.884,
    quantityBreaks: [
      { minCases: 1, unitPrice: 0.884 },
      { minCases: 6, unitPrice: 0.842 },
    ],
    dims: { height: "4.51 in", opening: "2.92 in", maxFill: "492 ml" },
    availableToSell: 6480,
    warehouses: [{ code: "HAY", name: "Hayward, CA", qty: 6480 }],
    source: "illustrative",
  },
  {
    id: "thirtytwo-110-rw-wppt",
    code: "32-110-RW-WPPT",
    name: "32 oz Regular Wall Jar",
    category: "Regular Wall Jars",
    size: "32 oz",
    sizeOz: 32,
    neck: "110mm-400",
    neckDiameterMm: 110,
    material: "White polypropylene #5 PP",
    color: "White",
    caseCount: 100,
    stock: "In stock",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: 1.472,
    quantityBreaks: [
      { minCases: 1, unitPrice: 1.472 },
      { minCases: 4, unitPrice: 1.405 },
    ],
    dims: { height: "6.02 in", opening: "3.62 in", maxFill: "985 ml" },
    availableToSell: 3200,
    warehouses: [{ code: "HAY", name: "Hayward, CA", qty: 3200 }],
    source: "illustrative",
  },
  {
    id: "cap-33-400-w",
    code: "CAP-33-400-W",
    name: "33mm-400 Ribbed Closure",
    category: "Lids & Closures",
    size: "33mm",
    sizeOz: 0,
    neck: "33mm-400",
    neckDiameterMm: 33,
    material: "White polypropylene #5 PP",
    color: "White",
    caseCount: 2000,
    stock: "In stock",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: 0.041,
    quantityBreaks: [
      { minCases: 1, unitPrice: 0.041 },
      { minCases: 10, unitPrice: 0.037 },
    ],
    availableToSell: 120000,
    warehouses: [{ code: "HAY", name: "Hayward, CA", qty: 120000 }],
    source: "illustrative",
  },
  {
    id: "cap-48-400-b",
    code: "CAP-48-400-B",
    name: "48mm-400 Ribbed Closure",
    category: "Lids & Closures",
    size: "48mm",
    sizeOz: 0,
    neck: "48mm-400",
    neckDiameterMm: 48,
    material: "Black polypropylene #5 PP",
    color: "Black",
    caseCount: 1000,
    stock: "In stock",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: 0.069,
    quantityBreaks: [
      { minCases: 1, unitPrice: 0.069 },
      { minCases: 12, unitPrice: 0.063 },
    ],
    availableToSell: 41000,
    warehouses: [{ code: "HAY", name: "Hayward, CA", qty: 41000 }],
    source: "illustrative",
  },
  {
    id: "cap-70-400-w-lin",
    code: "CAP-70-400-WL",
    name: "70mm-400 Lined Closure",
    category: "Lids & Closures",
    size: "70mm",
    sizeOz: 0,
    neck: "70mm-400",
    neckDiameterMm: 70,
    material: "White polypropylene with foam liner",
    color: "White",
    caseCount: 480,
    stock: "In stock",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: 0.142,
    quantityBreaks: [
      { minCases: 1, unitPrice: 0.142 },
      { minCases: 8, unitPrice: 0.133 },
    ],
    availableToSell: 15360,
    warehouses: [{ code: "HAY", name: "Hayward, CA", qty: 15360 }],
    source: "illustrative",
  },
  {
    id: "cap-89-400-w",
    code: "CAP-89-400-W",
    name: "89mm-400 Smooth Closure",
    category: "Lids & Closures",
    size: "89mm",
    sizeOz: 0,
    neck: "89mm-400",
    neckDiameterMm: 89,
    material: "White polypropylene #5 PP",
    color: "White",
    caseCount: 240,
    stock: "Low stock",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: 0.196,
    availableToSell: 1920,
    warehouses: [{ code: "HAY", name: "Hayward, CA", qty: 1920 }],
    source: "illustrative",
  },
  {
    id: "disc-33-hd",
    code: "DSC-33-HD",
    name: "33mm Pressure-Fit Disc",
    category: "Discs & Dust Covers",
    size: "33mm",
    sizeOz: 0,
    neck: "33mm-400",
    neckDiameterMm: 33,
    material: "LDPE",
    color: "Natural",
    caseCount: 5000,
    stock: "In stock",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: 0.014,
    quantityBreaks: [
      { minCases: 1, unitPrice: 0.014 },
      { minCases: 20, unitPrice: 0.011 },
    ],
    availableToSell: 250000,
    warehouses: [{ code: "HAY", name: "Hayward, CA", qty: 250000 }],
    source: "illustrative",
  },
  {
    id: "dust-70-clr",
    code: "DST-70-CLR",
    name: "70mm Clear Dust Cover",
    category: "Discs & Dust Covers",
    size: "70mm",
    sizeOz: 0,
    neck: "70mm-400",
    neckDiameterMm: 70,
    material: "PET",
    color: "Clear",
    caseCount: 1000,
    stock: "In stock",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: 0.052,
    availableToSell: 32000,
    warehouses: [{ code: "HAY", name: "Hayward, CA", qty: 32000 }],
    source: "illustrative",
  },
  {
    id: "addon-shrink-band",
    code: "ADD-SB-48",
    name: "48mm Tamper-Evident Shrink Band",
    category: "Add-ons",
    size: "48mm",
    sizeOz: 0,
    neck: "48mm-400",
    neckDiameterMm: 48,
    material: "PVC shrink film",
    color: "Clear",
    caseCount: 10000,
    stock: "In stock",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: 0.009,
    availableToSell: 400000,
    warehouses: [{ code: "HAY", name: "Hayward, CA", qty: 400000 }],
    source: "illustrative",
  },
  {
    id: "addon-custom-color",
    code: "ADD-COLOR-MATCH",
    name: "Custom Color Match (per resin lot)",
    category: "Add-ons",
    size: "Program",
    sizeOz: 0,
    neck: null,
    neckDiameterMm: null,
    material: "Masterbatch color program",
    color: "Specified by customer",
    caseCount: 1,
    stock: "Made to order",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: null,
    source: "illustrative",
    notes: "Quoted per resin lot and volume commitment.",
  },
  {
    id: "addon-print",
    code: "ADD-PRINT-1C",
    name: "One-Color Container Printing",
    category: "Add-ons",
    size: "Program",
    sizeOz: 0,
    neck: null,
    neckDiameterMm: null,
    material: "Screen / pad print program",
    color: "Specified by customer",
    caseCount: 1,
    stock: "Made to order",
    publicUnitPrice: null,
    publicCasePrice: null,
    demoUnitPrice: null,
    source: "illustrative",
    notes: "Quoted per artwork and run length.",
  },
];

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

export const compatibleWith = (product: Product) =>
  PRODUCTS.filter(
    (p) =>
      p.id !== product.id &&
      p.neck !== null &&
      p.neck === product.neck &&
      (product.category.includes("Jars")
        ? p.category === "Lids & Closures" ||
          p.category === "Discs & Dust Covers" ||
          p.category === "Add-ons"
        : p.category.includes("Jars")),
  );

export const money = (n: number, digits = 2) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
