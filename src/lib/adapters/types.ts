/**
 * Service adapter contracts.
 *
 * The UI only ever talks to these interfaces. A future engineer can implement
 * them against real Acumatica and payment-processor APIs without touching a
 * single component. Today they are backed by the mock implementations in
 * `./mock.ts`.
 */

import type { Product } from "@/data/products";
import type { DemoInvoice, DemoOrder, DemoAccount, PriceBookRow, InventoryState } from "@/data/portal";

export type AdapterMode = "mock" | "live";

export interface AdapterResult<T> {
  data: T;
  /** Where the data came from — surfaced in the UI as a provenance label. */
  mode: AdapterMode;
  asOf: string;
}

export interface SampleRequestPayload {
  contact: {
    company: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  shipping: "ground-complimentary" | "customer-carrier-account";
  carrierAccount?: string;
  items: { productId: string; code: string; qty: number; note?: string }[];
  notes?: string;
}

export interface SampleRequestResult {
  followUp: string[];
}

/** Result of re-reading price and availability at order-review time. */
export interface CartCheck {
  ok: boolean;
  message: string;
  issues: string[];
  priced: {
    productId: string;
    code: string;
    cases: number;
    unitPrice: number | null;
    basis: string | null;
    effective: string | null;
    availableCases: number | null;
    availability: InventoryState | null;
  }[];
}

/** Acumatica is the intended system of record for everything below. */
export interface AcumaticaAdapter {
  readonly mode: AdapterMode;
  listProducts(): Promise<AdapterResult<Product[]>>;
  getAccount(accountId: string): Promise<AdapterResult<DemoAccount | null>>;
  listOrders(accountId: string): Promise<AdapterResult<DemoOrder[]>>;
  listInvoices(accountId: string): Promise<AdapterResult<DemoInvoice[]>>;
  listPriceBook(accountId: string): Promise<AdapterResult<PriceBookRow[]>>;
  /** Re-checks price and availability at order review time. */
  revalidateCart(
    accountId: string,
    lines: { productId: string; cases: number }[],
    options?: { staleInventory?: boolean },
  ): Promise<AdapterResult<CartCheck>>;
  submitSampleRequest(payload: SampleRequestPayload): Promise<AdapterResult<SampleRequestResult>>;
}

export type PaymentMethodKind = "card" | "ach";

export type PaymentSimulation = "Applied" | "Declined" | "Received — ERP posting pending";

export interface PaymentIntentRequest {
  accountId: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethodKind;
  /** Which outcome the presenter chose to demonstrate. */
  simulate: PaymentSimulation;
}

export interface PaymentIntentResult {
  outcome: PaymentSimulation;
  /** Plain-language description of what a real processor would do next. */
  settlementSteps: string[];
}

/**
 * Payments adapter. The mock implementation deliberately collects no
 * financial details and moves no money.
 */
export interface PaymentsAdapter {
  readonly mode: AdapterMode;
  supportedMethods(): PaymentMethodKind[];
  createPaymentIntent(req: PaymentIntentRequest): Promise<AdapterResult<PaymentIntentResult>>;
}
