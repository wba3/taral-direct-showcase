/**
 * Mock adapter implementations. No network calls, no side effects.
 * Swap these for real Acumatica / processor clients behind the same interface.
 */

import { PRODUCTS } from "@/data/products";
import { INVOICES, PRICE_BOOK, SEED_ORDERS, getAccount } from "@/data/portal";
import type {
  AcumaticaAdapter,
  AdapterResult,
  PaymentIntentRequest,
  PaymentIntentResult,
  PaymentMethodKind,
  PaymentsAdapter,
  SampleRequestPayload,
  SampleRequestResult,
} from "./types";

const AS_OF = "August 29, 2026 · 6:02 AM PT";

const wrap = <T>(data: T): AdapterResult<T> => ({ data, mode: "mock", asOf: AS_OF });

const settle = <T>(data: T, ms = 260) =>
  new Promise<AdapterResult<T>>((resolve) => setTimeout(() => resolve(wrap(data)), ms));

export const mockAcumatica: AcumaticaAdapter = {
  mode: "mock",
  listProducts: () => settle(PRODUCTS, 120),
  getAccount: (accountId) => settle(getAccount(accountId), 120),
  listOrders: (accountId) => settle(SEED_ORDERS.filter((o) => o.accountId === accountId)),
  listInvoices: (accountId) => settle(INVOICES.filter((i) => i.accountId === accountId)),
  listPriceBook: (accountId) => settle(accountId ? PRICE_BOOK : []),
  revalidateCart: (_accountId, lines) => {
    const cases = lines.reduce((sum, l) => sum + l.cases, 0);
    return settle({
      ok: true,
      message:
        cases === 0
          ? "Nothing to revalidate."
          : `Prototype check: ${lines.length} line(s) / ${cases} cases re-priced against the demo price book. In production this call re-reads Acumatica price and available-to-sell before the order is written.`,
    });
  },
  submitSampleRequest: (payload: SampleRequestPayload) =>
    settle<SampleRequestResult>(
      {
        reference: "SMP-1048",
        followUp: [
          `Match or create the Acumatica contact for ${payload.contact.company}.`,
          "Create a sample fulfillment record against that contact.",
          "Alert customer service with the requested items and ship method.",
        ],
      },
      420,
    ),
};

export const mockPayments: PaymentsAdapter = {
  mode: "mock",
  supportedMethods: (): PaymentMethodKind[] => ["card", "ach"],
  createPaymentIntent: (req: PaymentIntentRequest) =>
    settle<PaymentIntentResult>(
      {
        reference: `DEMO-PAY-${req.invoiceId.replace(/\D/g, "").slice(-5)}`,
        settlementSteps: [
          "Stripe / Acumatica Payments authorizes and confirms the payment.",
          `Acumatica applies the payment to AR against ${req.invoiceId} and updates the open balance.`,
          "Settlement is reconciled to the bank deposit in Acumatica.",
        ],
      },
      520,
    ),
};

/** Single place a future engineer changes to point at live services. */
export const services = {
  erp: mockAcumatica,
  payments: mockPayments,
};
