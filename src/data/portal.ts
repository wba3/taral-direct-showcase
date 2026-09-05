/**
 * Synthetic account data for the Taral Direct prototype.
 *
 * Every figure here is invented for demonstration. Acumatica remains the
 * commercial source of truth; nothing in this file is read from or written to
 * any business system. Read accounts through `getAccount(accountId)` so a demo
 * session only ever surfaces the account it selected.
 */

/** Fixed, labeled demo business date. All date logic derives from this. */
export const DEMO_TODAY = "2026-09-05";
export const DEMO_TODAY_LABEL = "September 5, 2026";
export const DEMO_AS_OF = "September 5, 2026 · 7:14 AM PT";

export const isFuture = (date: string) => date > DEMO_TODAY;
export const isPast = (date: string) => date < DEMO_TODAY;

/* ── Roles ──────────────────────────────────────────────────────────────── */

export type DemoRoleId = "buyer" | "finance" | "ops";

export interface DemoRoleDef {
  id: DemoRoleId;
  label: string;
  person: string;
  /** Null for Taral staff, who are not scoped to a customer account. */
  accountId: string | null;
  summary: string;
}

export const DEMO_ROLES: DemoRoleDef[] = [
  {
    id: "buyer",
    label: "Distributor buyer",
    person: "Luis Moreno · Meridian Labs",
    accountId: "D-1042",
    summary: "Sees contract pricing, upcoming price changes, availability, and places orders.",
  },
  {
    id: "finance",
    label: "Customer finance",
    person: "Priya Raman · Harbor Botanicals",
    accountId: "C-2075",
    summary: "Sees invoices, terms, discount deadlines, and can run a simulated payment.",
  },
  {
    id: "ops",
    label: "Taral operations",
    person: "Casey Nolan · Taral customer service",
    accountId: null,
    summary: "Processes sample requests and clears simulated integration exceptions.",
  },
];

export const getRole = (id: DemoRoleId | null) => DEMO_ROLES.find((r) => r.id === id) ?? null;

/* ── Orders ─────────────────────────────────────────────────────────────── */

export type OrderStatus = "Submitted" | "Confirmed" | "In production" | "Shipped" | "Delivered";

export const ORDER_TIMELINE: OrderStatus[] = [
  "Submitted",
  "Confirmed",
  "In production",
  "Shipped",
  "Delivered",
];

export interface OrderLine {
  productId: string;
  code: string;
  description: string;
  /** Whole cases requested. */
  cases: number;
  /** Whole cases already shipped. Never greater than `cases`. */
  casesShipped: number;
  eachPerCase: number;
  unitPrice: number;
  lineStatus: "Awaiting release" | "Scheduled" | "Partially shipped" | "Shipped";
}

export interface DemoOrder {
  id: string;
  accountId: string;
  po: string;
  date: string;
  status: OrderStatus;
  shipment: string;
  tracking: string | null;
  lines: OrderLine[];
}

export const orderTotal = (order: DemoOrder) =>
  order.lines.reduce((sum, l) => sum + l.cases * l.eachPerCase * l.unitPrice, 0);

/* ── Invoices ───────────────────────────────────────────────────────────── */

export interface DemoInvoice {
  id: string;
  accountId: string;
  orderRef: string;
  issueDate: string;
  /** Early-payment discount deadline. */
  discountDate: string;
  dueDate: string;
  originalTotal: number;
  /** Payment already applied in the seed data. */
  seedPaid: number;
  /** Credit memo applied to this invoice. */
  credit: number;
  lines: { description: string; qty: string; amount: number }[];
}

export type InvoiceStatus = "Paid" | "Partially paid" | "Open" | "Overdue" | "Posting pending";

/** Money the customer still owes after seed payments, credits and demo activity. */
export function invoiceOutstanding(inv: DemoInvoice, appliedExtra = 0) {
  return Math.max(0, inv.originalTotal - inv.credit - inv.seedPaid - appliedExtra);
}

export function invoiceStatus(
  inv: DemoInvoice,
  appliedExtra = 0,
  pendingAmount = 0,
): InvoiceStatus {
  const outstanding = invoiceOutstanding(inv, appliedExtra);
  if (pendingAmount > 0) return "Posting pending";
  if (outstanding === 0) return "Paid";
  if (isPast(inv.dueDate)) return "Overdue";
  if (inv.seedPaid + appliedExtra > 0 || inv.credit > 0) return "Partially paid";
  return "Open";
}

/* ── Price book ─────────────────────────────────────────────────────────── */

export type PriceBasis = "Public list" | "Price class" | "Customer override";

export interface PriceBookRow {
  accountId: string;
  sku: string;
  productId: string;
  description: string;
  uom: string;
  /** Quantity break: minimum whole cases for this price. */
  minCases: number;
  currency: "USD";
  currentPrice: number;
  /** Effective date of `currentPrice`; always on or before the demo date. */
  effective: string;
  /** Announced future price, if one exists. Never applied before its date. */
  upcomingPrice: number | null;
  upcomingEffective: string | null;
  basis: PriceBasis;
  history: { effective: string; price: number; basis: PriceBasis }[];
}

export type InventoryState = "Fresh" | "Stale" | "Unavailable";

export interface InventorySnapshot {
  productId: string;
  availableCases: number;
  warehouse: string;
  asOf: string;
  state: InventoryState;
}

/* ── Accounts ───────────────────────────────────────────────────────────── */

export type PortalRole = "Customer Admin" | "Buyer" | "Accounts Payable";

export interface DemoAccount {
  id: string;
  name: string;
  terms: string;
  priceClass: string;
  /** Minimum whole cases per merchandise line. */
  caseMinimum: number;
  smallOrderFee: string;
  asOf: string;
  contacts: { name: string; title: string; email: string; role: PortalRole }[];
  locations: { label: string; address: string; default?: boolean }[];
  alerts: { tone: "info" | "action"; text: string }[];
}

export const ACCOUNTS_LIST: DemoAccount[] = [
  {
    id: "D-1042",
    name: "Meridian Labs",
    terms: "Net 30 · 1% 10 net 30",
    priceClass: "DIST-2",
    caseMinimum: 1,
    smallOrderFee: "$45 handling under 5 cases",
    asOf: DEMO_AS_OF,
    contacts: [
      {
        name: "Dana Whitfield",
        title: "Director of Operations",
        email: "dana.whitfield@example.com",
        role: "Customer Admin",
      },
      {
        name: "Luis Moreno",
        title: "Purchasing Manager",
        email: "luis.moreno@example.com",
        role: "Buyer",
      },
    ],
    locations: [
      {
        label: "Meridian Labs — Fill Line 2",
        address: "1180 Cabot Industrial Way, Reno, NV 89506",
        default: true,
      },
      {
        label: "Meridian Labs — Contract Packager",
        address: "4400 Cordelia Ct, Suisun City, CA 94585",
      },
    ],
    alerts: [
      { tone: "info", text: "Contract price update takes effect October 1, 2026." },
      { tone: "action", text: "Order SO-24817 is partially shipped." },
    ],
  },
  {
    id: "C-2075",
    name: "Harbor Botanicals",
    terms: "Net 45 · 2% 15 net 45",
    priceClass: "DIST-4",
    caseMinimum: 2,
    smallOrderFee: "$45 handling under 5 cases",
    asOf: DEMO_AS_OF,
    contacts: [
      {
        name: "Priya Raman",
        title: "Controller",
        email: "priya.raman@example.com",
        role: "Accounts Payable",
      },
      {
        name: "Marcus Bell",
        title: "Production Planner",
        email: "marcus.bell@example.com",
        role: "Buyer",
      },
    ],
    locations: [
      {
        label: "Harbor Botanicals — Blending",
        address: "2210 Marine View Dr, Tacoma, WA 98422",
        default: true,
      },
    ],
    alerts: [
      { tone: "action", text: "Invoice INV-89974 is past its due date." },
      { tone: "info", text: "Early-payment discount on INV-90233 ends September 9, 2026." },
    ],
  },
];

export const ACCOUNTS: Record<string, DemoAccount> = Object.fromEntries(
  ACCOUNTS_LIST.map((a) => [a.id, a]),
);

/** Kept for screens that need a default before a role is chosen. */
export const ACCOUNT = ACCOUNTS_LIST[0]!;

export const getAccount = (accountId: string | null) =>
  accountId ? (ACCOUNTS[accountId] ?? null) : null;

/* ── Seed orders ────────────────────────────────────────────────────────── */

export const SEED_ORDERS: DemoOrder[] = [
  {
    id: "SO-24817",
    accountId: "D-1042",
    po: "ML-PO-88231",
    date: "2026-08-24",
    status: "Shipped",
    shipment: "Partial shipment released Sept 2 · Hayward, CA",
    tracking: "DEMO-TRK-4417",
    lines: [
      {
        productId: "quarter-33-rw-wppt",
        code: "1/4-33-RW-WPPT",
        description: "1/4 oz 33mm Regular Wall, white PP",
        cases: 12,
        casesShipped: 8,
        eachPerCase: 2000,
        unitPrice: 0.058,
        lineStatus: "Partially shipped",
      },
      {
        productId: "cap-33-400-w",
        code: "CAP-33-400-W",
        description: "33mm-400 ribbed closure, white",
        cases: 12,
        casesShipped: 12,
        eachPerCase: 2000,
        unitPrice: 0.037,
        lineStatus: "Shipped",
      },
    ],
  },
  {
    id: "SO-24702",
    accountId: "D-1042",
    po: "ML-PO-87994",
    date: "2026-08-11",
    status: "In production",
    shipment: "Molding run scheduled Sept 9",
    tracking: null,
    lines: [
      {
        productId: "four-70-dw-wppt",
        code: "4-70-DW-WPPT",
        description: "4 oz 70mm Double Wall, white PP",
        cases: 15,
        casesShipped: 0,
        eachPerCase: 480,
        unitPrice: 0.548,
        lineStatus: "Scheduled",
      },
      {
        productId: "cap-70-400-w-lin",
        code: "CAP-70-400-WL",
        description: "70mm-400 lined closure, white",
        cases: 15,
        casesShipped: 0,
        eachPerCase: 480,
        unitPrice: 0.133,
        lineStatus: "Scheduled",
      },
    ],
  },
  {
    id: "SO-24588",
    accountId: "D-1042",
    po: "ML-PO-87610",
    date: "2026-07-29",
    status: "Delivered",
    shipment: "Delivered Aug 3 · Reno, NV",
    tracking: "DEMO-TRK-4188",
    lines: [
      {
        productId: "two-53-tw-blk",
        code: "2-53-TW-BPPT",
        description: "2 oz 53mm Thick Wall, black PP",
        cases: 10,
        casesShipped: 10,
        eachPerCase: 720,
        unitPrice: 0.249,
        lineStatus: "Shipped",
      },
      {
        productId: "disc-33-hd",
        code: "DSC-33-HD",
        description: "33mm pressure-fit disc, LDPE",
        cases: 4,
        casesShipped: 4,
        eachPerCase: 5000,
        unitPrice: 0.011,
        lineStatus: "Shipped",
      },
    ],
  },
  {
    id: "SO-24790",
    accountId: "C-2075",
    po: "HB-4471",
    date: "2026-08-19",
    status: "Confirmed",
    shipment: "Awaiting release · Hayward, CA",
    tracking: null,
    lines: [
      {
        productId: "one-48-tw-wppt",
        code: "1-48-TW-WPPT",
        description: "1 oz 48mm Thick Wall, white PP",
        cases: 20,
        casesShipped: 0,
        eachPerCase: 1000,
        unitPrice: 0.196,
        lineStatus: "Awaiting release",
      },
    ],
  },
];

/* ── Seed invoices ──────────────────────────────────────────────────────── */

export const INVOICES: DemoInvoice[] = [
  {
    id: "INV-90233",
    accountId: "D-1042",
    orderRef: "SO-24817",
    issueDate: "2026-08-25",
    discountDate: "2026-09-09",
    dueDate: "2026-09-24",
    originalTotal: 2280,
    seedPaid: 0,
    credit: 0,
    lines: [
      { description: "1/4-33-RW-WPPT · 8 cases shipped", qty: "16,000 ea", amount: 928 },
      { description: "CAP-33-400-W · 12 cases shipped", qty: "24,000 ea", amount: 888 },
      { description: "Freight · prepaid and added", qty: "1", amount: 464 },
    ],
  },
  {
    id: "INV-90118",
    accountId: "D-1042",
    orderRef: "SO-24702",
    issueDate: "2026-08-12",
    discountDate: "2026-08-22",
    dueDate: "2026-09-11",
    originalTotal: 4903,
    seedPaid: 2000,
    credit: 0,
    lines: [
      { description: "4-70-DW-WPPT · 15 cases", qty: "7,200 ea", amount: 3946 },
      { description: "CAP-70-400-WL · 15 cases", qty: "7,200 ea", amount: 957 },
    ],
  },
  {
    id: "INV-89974",
    accountId: "C-2075",
    orderRef: "SO-24631",
    issueDate: "2026-07-18",
    discountDate: "2026-08-02",
    dueDate: "2026-08-17",
    originalTotal: 11237,
    seedPaid: 0,
    credit: 420,
    lines: [
      { description: "16-89-RW-WPPT · 40 cases", qty: "7,200 ea", amount: 6365 },
      { description: "CAP-89-400-W · 40 cases", qty: "9,600 ea", amount: 1882 },
      { description: "32-110-RW-WPPT · 20 cases", qty: "2,000 ea", amount: 2990 },
    ],
  },
  {
    id: "INV-90301",
    accountId: "C-2075",
    orderRef: "SO-24790",
    issueDate: "2026-08-28",
    discountDate: "2026-09-12",
    dueDate: "2026-10-12",
    originalTotal: 3920,
    seedPaid: 0,
    credit: 0,
    lines: [
      { description: "1-48-TW-WPPT · 20 cases", qty: "20,000 ea", amount: 3920 },
    ],
  },
  {
    id: "INV-89740",
    accountId: "D-1042",
    orderRef: "SO-24588",
    issueDate: "2026-07-30",
    discountDate: "2026-08-14",
    dueDate: "2026-08-29",
    originalTotal: 2013,
    seedPaid: 2013,
    credit: 0,
    lines: [
      { description: "2-53-TW-BPPT · 10 cases", qty: "7,200 ea", amount: 1793 },
      { description: "DSC-33-HD · 4 cases", qty: "20,000 ea", amount: 220 },
    ],
  },
];

/* ── Seed price entries ─────────────────────────────────────────────────── */

export const PRICE_BOOK: PriceBookRow[] = [
  {
    accountId: "D-1042",
    sku: "1/4-33-RW-WPPT",
    productId: "quarter-33-rw-wppt",
    description: "1/4 oz 33mm Regular Wall, white PP",
    uom: "CASE / 2,000 ea",
    minCases: 1,
    currency: "USD",
    currentPrice: 0.058,
    effective: "2026-03-01",
    upcomingPrice: 0.061,
    upcomingEffective: "2026-10-01",
    basis: "Customer override",
    history: [
      { effective: "2026-03-01", price: 0.058, basis: "Customer override" },
      { effective: "2025-09-01", price: 0.065, basis: "Price class" },
    ],
  },
  {
    accountId: "D-1042",
    sku: "1/4-33-RW-WPPT",
    productId: "quarter-33-rw-wppt",
    description: "1/4 oz 33mm Regular Wall, white PP — 20 case break",
    uom: "CASE / 2,000 ea",
    minCases: 20,
    currency: "USD",
    currentPrice: 0.054,
    effective: "2026-03-01",
    upcomingPrice: 0.056,
    upcomingEffective: "2026-10-01",
    basis: "Customer override",
    history: [{ effective: "2026-03-01", price: 0.054, basis: "Customer override" }],
  },
  {
    accountId: "D-1042",
    sku: "CAP-33-400-W",
    productId: "cap-33-400-w",
    description: "33mm-400 ribbed closure, white",
    uom: "CASE / 2,000 ea",
    minCases: 1,
    currency: "USD",
    currentPrice: 0.037,
    effective: "2026-01-15",
    upcomingPrice: null,
    upcomingEffective: null,
    basis: "Price class",
    history: [{ effective: "2026-01-15", price: 0.037, basis: "Price class" }],
  },
  {
    accountId: "D-1042",
    sku: "4-70-DW-WPPT",
    productId: "four-70-dw-wppt",
    description: "4 oz 70mm Double Wall, white PP",
    uom: "CASE / 480 ea",
    minCases: 1,
    currency: "USD",
    currentPrice: 0.548,
    effective: "2026-02-01",
    upcomingPrice: 0.572,
    upcomingEffective: "2026-10-01",
    basis: "Customer override",
    history: [
      { effective: "2026-02-01", price: 0.548, basis: "Customer override" },
      { effective: "2025-08-01", price: 0.579, basis: "Price class" },
    ],
  },
  {
    accountId: "D-1042",
    sku: "2-53-TW-BPPT",
    productId: "two-53-tw-blk",
    description: "2 oz 53mm Thick Wall, black PP",
    uom: "CASE / 720 ea",
    minCases: 2,
    currency: "USD",
    currentPrice: 0.249,
    effective: "2026-03-01",
    upcomingPrice: null,
    upcomingEffective: null,
    basis: "Price class",
    history: [{ effective: "2026-03-01", price: 0.249, basis: "Price class" }],
  },
  {
    accountId: "D-1042",
    sku: "DSC-33-HD",
    productId: "disc-33-hd",
    description: "33mm pressure-fit disc, LDPE",
    uom: "CASE / 5,000 ea",
    minCases: 4,
    currency: "USD",
    currentPrice: 0.011,
    effective: "2025-08-01",
    upcomingPrice: null,
    upcomingEffective: null,
    basis: "Price class",
    history: [{ effective: "2025-08-01", price: 0.011, basis: "Price class" }],
  },
  {
    accountId: "C-2075",
    sku: "1-48-TW-WPPT",
    productId: "one-48-tw-wppt",
    description: "1 oz 48mm Thick Wall, white PP",
    uom: "CASE / 1,000 ea",
    minCases: 2,
    currency: "USD",
    currentPrice: 0.196,
    effective: "2026-04-01",
    upcomingPrice: 0.204,
    upcomingEffective: "2026-11-01",
    basis: "Price class",
    history: [{ effective: "2026-04-01", price: 0.196, basis: "Price class" }],
  },
  {
    accountId: "C-2075",
    sku: "CAP-48-400-B",
    productId: "cap-48-400-b",
    description: "48mm-400 ribbed closure, black",
    uom: "CASE / 1,000 ea",
    minCases: 2,
    currency: "USD",
    currentPrice: 0.052,
    effective: "2026-04-01",
    upcomingPrice: null,
    upcomingEffective: null,
    basis: "Price class",
    history: [{ effective: "2026-04-01", price: 0.052, basis: "Price class" }],
  },
  {
    accountId: "C-2075",
    sku: "2-53-TW-BPPT",
    productId: "two-53-tw-blk",
    description: "2 oz 53mm Thick Wall, black PP",
    uom: "CASE / 720 ea",
    minCases: 2,
    currency: "USD",
    currentPrice: 0.262,
    effective: "2026-04-01",
    upcomingPrice: 0.255,
    upcomingEffective: "2026-10-15",
    basis: "Price class",
    history: [{ effective: "2026-04-01", price: 0.262, basis: "Price class" }],
  },
];

export const priceBookFor = (accountId: string | null) =>
  accountId ? PRICE_BOOK.filter((r) => r.accountId === accountId) : [];

/**
 * Resolves the price a line should use today for a given case quantity.
 * Future-effective prices are never applied early.
 */
export function resolvePrice(accountId: string | null, productId: string, cases: number) {
  const rows = priceBookFor(accountId)
    .filter((r) => r.productId === productId && !isFuture(r.effective) && r.minCases <= cases)
    .sort((a, b) => b.minCases - a.minCases);
  return rows[0] ?? null;
}

/* ── Seed inventory ─────────────────────────────────────────────────────── */

export const INVENTORY: InventorySnapshot[] = [
  {
    productId: "quarter-33-rw-wppt",
    availableCases: 48,
    warehouse: "Hayward, CA",
    asOf: DEMO_AS_OF,
    state: "Fresh",
  },
  {
    productId: "cap-33-400-w",
    availableCases: 96,
    warehouse: "Hayward, CA",
    asOf: DEMO_AS_OF,
    state: "Fresh",
  },
  {
    productId: "four-70-dw-wppt",
    availableCases: 6,
    warehouse: "Hayward, CA",
    asOf: DEMO_AS_OF,
    state: "Fresh",
  },
  {
    productId: "two-53-tw-blk",
    availableCases: 0,
    warehouse: "Hayward, CA",
    asOf: DEMO_AS_OF,
    state: "Unavailable",
  },
  {
    productId: "one-48-tw-wppt",
    availableCases: 34,
    warehouse: "Hayward, CA",
    asOf: DEMO_AS_OF,
    state: "Fresh",
  },
];

export const inventoryFor = (productId: string) =>
  INVENTORY.find((i) => i.productId === productId) ?? null;
