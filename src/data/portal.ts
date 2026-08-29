/**
 * Demo distributor data. One account only; every consumer must read it through
 * `getAccount(accountId)` so a demo session can never surface another
 * customer's simulated records.
 */

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
  cases: number;
  eachPerCase: number;
  unitPrice: number;
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

export interface DemoInvoice {
  id: string;
  accountId: string;
  orderRef: string;
  issueDate: string;
  discountDate: string;
  dueDate: string;
  originalTotal: number;
  balance: number;
  status: "Open" | "Paid" | "Overdue";
  lines: { description: string; qty: string; amount: number }[];
}

export interface PriceBookRow {
  sku: string;
  description: string;
  uom: string;
  minQty: number;
  priorPrice: number;
  currentPrice: number;
  effective: string;
  basis: "Public list" | "Price class DIST-2" | "Customer override";
  history: { effective: string; price: number; basis: string }[];
}

export interface DemoAccount {
  id: string;
  name: string;
  terms: string;
  priceClass: string;
  openOrders: number;
  openInvoiceTotal: number;
  nextPaymentDue: string;
  asOf: string;
  contacts: { name: string; title: string; email: string; role: PortalRole }[];
  locations: { label: string; address: string; default?: boolean }[];
  alerts: { tone: "info" | "action"; text: string }[];
}

export type PortalRole = "Customer Admin" | "Buyer" | "Accounts Payable";

export const ACCOUNT: DemoAccount = {
  id: "D-1042",
  name: "Meridian Labs",
  terms: "Net 30 · 1% 10 net 30 discount",
  priceClass: "DIST-2",
  openOrders: 3,
  openInvoiceTotal: 18420,
  nextPaymentDue: "September 15, 2026",
  asOf: "August 29, 2026 · 6:02 AM PT",
  contacts: [
    {
      name: "Dana Whitfield",
      title: "Director of Operations",
      email: "dana.whitfield@meridianlabs.example",
      role: "Customer Admin",
    },
    {
      name: "Luis Moreno",
      title: "Purchasing Manager",
      email: "luis.moreno@meridianlabs.example",
      role: "Buyer",
    },
    {
      name: "Priya Raman",
      title: "AP Specialist",
      email: "ap@meridianlabs.example",
      role: "Accounts Payable",
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
    {
      tone: "info",
      text: "Private price book update effective September 1, 2026.",
    },
    { tone: "action", text: "Order SO-24817 is awaiting shipment." },
  ],
};

export const ACCOUNTS: Record<string, DemoAccount> = { [ACCOUNT.id]: ACCOUNT };

export const getAccount = (accountId: string | null) =>
  accountId ? (ACCOUNTS[accountId] ?? null) : null;

export const SEED_ORDERS: DemoOrder[] = [
  {
    id: "SO-24817",
    accountId: "D-1042",
    po: "ML-PO-88231",
    date: "2026-08-24",
    status: "Confirmed",
    shipment: "Awaiting shipment · Hayward, CA",
    tracking: null,
    lines: [
      {
        productId: "quarter-33-rw-wppt",
        code: "1/4-33-RW-WPPT",
        description: "1/4 oz 33mm Regular Wall, white PP",
        cases: 12,
        eachPerCase: 2000,
        unitPrice: 0.058,
      },
      {
        productId: "cap-33-400-w",
        code: "CAP-33-400-W",
        description: "33mm-400 ribbed closure, white",
        cases: 12,
        eachPerCase: 2000,
        unitPrice: 0.037,
      },
    ],
  },
  {
    id: "SO-24702",
    accountId: "D-1042",
    po: "ML-PO-87994",
    date: "2026-08-11",
    status: "In production",
    shipment: "Molding run scheduled Sept 2",
    tracking: null,
    lines: [
      {
        productId: "four-70-dw-wppt",
        code: "4-70-DW-WPPT",
        description: "4 oz 70mm Double Wall, white PP",
        cases: 15,
        eachPerCase: 480,
        unitPrice: 0.548,
      },
      {
        productId: "cap-70-400-w-lin",
        code: "CAP-70-400-WL",
        description: "70mm-400 lined closure, white",
        cases: 15,
        eachPerCase: 480,
        unitPrice: 0.133,
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
    tracking: "TRACKING-PLACEHOLDER",
    lines: [
      {
        productId: "two-53-tw-blk",
        code: "2-53-TW-BPPT",
        description: "2 oz 53mm Thick Wall, black PP",
        cases: 10,
        eachPerCase: 720,
        unitPrice: 0.249,
      },
      {
        productId: "disc-33-hd",
        code: "DSC-33-HD",
        description: "33mm pressure-fit disc, LDPE",
        cases: 4,
        eachPerCase: 5000,
        unitPrice: 0.011,
      },
    ],
  },
];

export const INVOICES: DemoInvoice[] = [
  {
    id: "INV-90233",
    accountId: "D-1042",
    orderRef: "SO-24817",
    issueDate: "2026-08-25",
    discountDate: "2026-09-04",
    dueDate: "2026-09-24",
    originalTotal: 2280,
    balance: 2280,
    status: "Open",
    lines: [
      { description: "1/4-33-RW-WPPT · 12 cases", qty: "24,000 ea", amount: 1392 },
      { description: "CAP-33-400-W · 12 cases", qty: "24,000 ea", amount: 888 },
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
    balance: 4903,
    status: "Open",
    lines: [
      { description: "4-70-DW-WPPT · 15 cases", qty: "7,200 ea", amount: 3946 },
      { description: "CAP-70-400-WL · 15 cases", qty: "7,200 ea", amount: 957 },
    ],
  },
  {
    id: "INV-89974",
    accountId: "D-1042",
    orderRef: "SO-24631",
    issueDate: "2026-07-18",
    discountDate: "2026-07-28",
    dueDate: "2026-08-17",
    originalTotal: 11237,
    balance: 11237,
    status: "Overdue",
    lines: [
      { description: "16-89-RW-WPPT · 40 cases", qty: "7,200 ea", amount: 6365 },
      { description: "CAP-89-400-W · 40 cases", qty: "9,600 ea", amount: 1882 },
      { description: "32-110-RW-WPPT · 20 cases", qty: "2,000 ea", amount: 2990 },
    ],
  },
  {
    id: "INV-89740",
    accountId: "D-1042",
    orderRef: "SO-24588",
    issueDate: "2026-07-30",
    discountDate: "2026-08-09",
    dueDate: "2026-08-29",
    originalTotal: 2013,
    balance: 0,
    status: "Paid",
    lines: [
      { description: "2-53-TW-BPPT · 10 cases", qty: "7,200 ea", amount: 1793 },
      { description: "DSC-33-HD · 4 cases", qty: "20,000 ea", amount: 220 },
    ],
  },
];

export const PRICE_BOOK: PriceBookRow[] = [
  {
    sku: "1/4-33-RW-WPPT",
    description: "1/4 oz 33mm Regular Wall, white PP",
    uom: "CASE / 2,000 ea",
    minQty: 1,
    priorPrice: 0.062,
    currentPrice: 0.058,
    effective: "2026-09-01",
    basis: "Customer override",
    history: [
      { effective: "2026-09-01", price: 0.058, basis: "Customer override" },
      { effective: "2026-03-01", price: 0.062, basis: "Price class DIST-2" },
      { effective: "2025-09-01", price: 0.065, basis: "Price class DIST-2" },
    ],
  },
  {
    sku: "CAP-33-400-W",
    description: "33mm-400 ribbed closure, white",
    uom: "CASE / 2,000 ea",
    minQty: 1,
    priorPrice: 0.041,
    currentPrice: 0.037,
    effective: "2026-09-01",
    basis: "Price class DIST-2",
    history: [
      { effective: "2026-09-01", price: 0.037, basis: "Price class DIST-2" },
      { effective: "2026-01-15", price: 0.041, basis: "Price class DIST-2" },
    ],
  },
  {
    sku: "1-48-TW-WPPT",
    description: "1 oz 48mm Thick Wall, white PP",
    uom: "CASE / 1,000 ea",
    minQty: 1,
    priorPrice: 0.178,
    currentPrice: 0.184,
    effective: "2026-09-01",
    basis: "Price class DIST-2",
    history: [
      { effective: "2026-09-01", price: 0.184, basis: "Price class DIST-2" },
      { effective: "2025-11-01", price: 0.178, basis: "Price class DIST-2" },
    ],
  },
  {
    sku: "2-53-TW-BPPT",
    description: "2 oz 53mm Thick Wall, black PP",
    uom: "CASE / 720 ea",
    minQty: 2,
    priorPrice: 0.249,
    currentPrice: 0.249,
    effective: "2026-03-01",
    basis: "Price class DIST-2",
    history: [{ effective: "2026-03-01", price: 0.249, basis: "Price class DIST-2" }],
  },
  {
    sku: "4-70-DW-WPPT",
    description: "4 oz 70mm Double Wall, white PP",
    uom: "CASE / 480 ea",
    minQty: 1,
    priorPrice: 0.579,
    currentPrice: 0.548,
    effective: "2026-09-01",
    basis: "Customer override",
    history: [
      { effective: "2026-09-01", price: 0.548, basis: "Customer override" },
      { effective: "2026-02-01", price: 0.579, basis: "Price class DIST-2" },
    ],
  },
  {
    sku: "16-89-RW-WPPT",
    description: "16 oz 89mm Regular Wall, white PP",
    uom: "CASE / 180 ea",
    minQty: 1,
    priorPrice: 0.842,
    currentPrice: 0.884,
    effective: "2026-09-01",
    basis: "Price class DIST-2",
    history: [
      { effective: "2026-09-01", price: 0.884, basis: "Price class DIST-2" },
      { effective: "2025-10-01", price: 0.842, basis: "Price class DIST-2" },
    ],
  },
  {
    sku: "DSC-33-HD",
    description: "33mm pressure-fit disc, LDPE",
    uom: "CASE / 5,000 ea",
    minQty: 4,
    priorPrice: 0.012,
    currentPrice: 0.011,
    effective: "2026-09-01",
    basis: "Price class DIST-2",
    history: [
      { effective: "2026-09-01", price: 0.011, basis: "Price class DIST-2" },
      { effective: "2025-08-01", price: 0.012, basis: "Public list" },
    ],
  },
  {
    sku: "ADD-SB-48",
    description: "48mm tamper-evident shrink band",
    uom: "CASE / 10,000 ea",
    minQty: 1,
    priorPrice: 0.009,
    currentPrice: 0.009,
    effective: "2026-01-01",
    basis: "Public list",
    history: [{ effective: "2026-01-01", price: 0.009, basis: "Public list" }],
  },
];
