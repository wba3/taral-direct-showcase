/**
 * Mock adapter implementations. No network calls, no side effects.
 * Swap these for real Acumatica / processor clients behind the same interface.
 */

import { PRODUCTS } from "@/data/products";
import {
  DEMO_AS_OF,
  INVENTORY,
  INVOICES,
  SEED_ORDERS,
  getAccount,
  priceBookFor,
  resolvePrice,
} from "@/data/portal";
import type {
  AcumaticaAdapter,
  AdapterResult,
  CartCheck,
  PaymentIntentRequest,
  PaymentIntentResult,
  PaymentMethodKind,
  PaymentsAdapter,
  SampleRequestPayload,
  SampleRequestResult,
} from "./types";

const wrap = <T>(data: T): AdapterResult<T> => ({ data, mode: "mock", asOf: DEMO_AS_OF });

const settle = <T>(data: T, ms = 240) =>
  new Promise<AdapterResult<T>>((resolve) => setTimeout(() => resolve(wrap(data)), ms));

export const mockAcumatica: AcumaticaAdapter = {
  mode: "mock",
  listProducts: () => settle(PRODUCTS, 120),
  getAccount: (accountId) => settle(getAccount(accountId), 120),
  listOrders: (accountId) => settle(SEED_ORDERS.filter((o) => o.accountId === accountId)),
  listInvoices: (accountId) => settle(INVOICES.filter((i) => i.accountId === accountId)),
  listPriceBook: (accountId) => settle(priceBookFor(accountId)),
  /**
   * Re-reads price and availability the way an order-review call would. Purely
   * local: it compares the draft against the seeded price book and snapshot.
   */
  revalidateCart: (accountId, lines, options) => {
    const account = getAccount(accountId);
    const issues: string[] = [];
    const priced: CartCheck["priced"] = [];

    for (const line of lines) {
      const row = resolvePrice(accountId, line.productId, line.cases);
      const snap = INVENTORY.find((i) => i.productId === line.productId);
      const product = PRODUCTS.find((p) => p.id === line.productId);
      const code = product?.code ?? line.productId;

      if (account && line.cases < account.caseMinimum) {
        issues.push(`${code}: below the ${account.caseMinimum}-case minimum for this account.`);
      }
      if (!row) {
        issues.push(`${code}: no current price entry — customer service would quote this line.`);
      }
      if (!snap) {
        issues.push(`${code}: no availability snapshot — request details.`);
      } else if (snap.state === "Unavailable" || snap.availableCases === 0) {
        issues.push(`${code}: not available to sell today.`);
      } else if (options?.staleInventory) {
        issues.push(`${code}: availability snapshot is stale and cannot be trusted for a commitment.`);
      } else if (snap.availableCases < line.cases) {
        issues.push(`${code}: ${snap.availableCases} case(s) available, ${line.cases} requested.`);
      }

      priced.push({
        productId: line.productId,
        code,
        cases: line.cases,
        unitPrice: row?.currentPrice ?? null,
        basis: row ? `${row.basis} · ${row.minCases}+ cases` : null,
        effective: row?.effective ?? null,
        availableCases: snap?.availableCases ?? null,
        availability: options?.staleInventory && snap?.state === "Fresh" ? "Stale" : (snap?.state ?? null),
      });
    }

    return settle<CartCheck>({
      ok: issues.length === 0 && lines.length > 0,
      issues,
      priced,
      message:
        lines.length === 0
          ? "Nothing to revalidate."
          : issues.length === 0
            ? `${lines.length} line(s) re-priced at their final quantity and checked against the demo availability snapshot.`
            : `${issues.length} issue(s) must be resolved before this draft can be submitted.`,
    });
  },
  submitSampleRequest: (payload: SampleRequestPayload) =>
    settle<SampleRequestResult>(
      {
        followUp: [
          `Match or create the Acumatica contact for ${payload.contact.company}.`,
          "Create a sample fulfillment record against that contact.",
          "Alert customer service with the requested items and ship method.",
        ],
      },
      380,
    ),
};

export const mockPayments: PaymentsAdapter = {
  mode: "mock",
  supportedMethods: (): PaymentMethodKind[] => ["card", "ach"],
  createPaymentIntent: (req: PaymentIntentRequest) =>
    settle<PaymentIntentResult>(
      {
        outcome: req.simulate,
        settlementSteps:
          req.simulate === "Declined"
            ? [
                "The processor refuses the authorization; no funds move.",
                "Acumatica keeps the invoice open at its current balance.",
                "The customer is prompted to try another method.",
              ]
            : req.simulate === "Received — ERP posting pending"
              ? [
                  "The processor authorizes and captures the payment.",
                  "The application to Acumatica AR has not completed, so the invoice balance is unchanged.",
                  "Customer service retries the posting; the same collection is applied, never re-charged.",
                ]
              : [
                  "The processor authorizes and captures the payment.",
                  `Acumatica applies the payment to AR against ${req.invoiceId} and reduces the open balance.`,
                  "Settlement is reconciled to the bank deposit in Acumatica.",
                ],
      },
      460,
    ),
};

/** Single place a future engineer changes to point at live services. */
export const services = {
  erp: mockAcumatica,
  payments: mockPayments,
};
