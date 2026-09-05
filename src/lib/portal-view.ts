/**
 * Derived views over the synthetic demo data.
 *
 * Every figure a portal screen shows is computed here from the seed data plus
 * whatever the presenter did in this browser — nothing is hardcoded, so totals
 * always agree with the rows above them.
 */

import { useMemo } from "react";
import {
  DEMO_AS_OF,
  DEMO_TODAY_LABEL,
  INVENTORY,
  INVOICES,
  ORDER_TIMELINE,
  getAccount,
  getRole,
  invoiceOutstanding,
  invoiceStatus,
  isFuture,
  orderTotal,
  priceBookFor,
  type DemoInvoice,
  type DemoOrder,
  type InventorySnapshot,
  type InvoiceStatus,
  type PriceBookRow,
} from "@/data/portal";
import { useDemo } from "@/lib/demo-store";

export interface InvoiceView {
  invoice: DemoInvoice;
  /** Payment applied in seed data plus applied demo payments. */
  paid: number;
  credit: number;
  pending: number;
  outstanding: number;
  status: InvoiceStatus;
  overdue: boolean;
  discountOpen: boolean;
}

export function usePortalView() {
  const demo = useDemo();
  const { role, accountId, orders, paymentFor, simulatePriceUpdate, simulateStaleInventory } = demo;
  const account = getAccount(accountId);
  const roleDef = getRole(role);

  const invoices = useMemo<InvoiceView[]>(() => {
    const rows = accountId ? INVOICES.filter((i) => i.accountId === accountId) : INVOICES;
    return rows.map((invoice) => {
      const state = paymentFor(invoice.id);
      const paid = invoice.seedPaid + state.applied;
      const outstanding = invoiceOutstanding(invoice, state.applied);
      return {
        invoice,
        paid,
        credit: invoice.credit,
        pending: state.pending,
        outstanding,
        status: invoiceStatus(invoice, state.applied, state.pending),
        overdue: outstanding > 0 && !isFuture(invoice.dueDate),
        discountOpen: isFuture(invoice.discountDate),
      };
    });
  }, [accountId, paymentFor]);

  const totals = useMemo(() => {
    const outstanding = invoices.reduce((sum, v) => sum + v.outstanding, 0);
    const pending = invoices.reduce((sum, v) => sum + v.pending, 0);
    const overdue = invoices
      .filter((v) => v.overdue)
      .reduce((sum, v) => sum + v.outstanding, 0);
    const openOrders = orders.filter((o) => o.status !== "Delivered").length;
    const nextDue = invoices
      .filter((v) => v.outstanding > 0)
      .map((v) => v.invoice.dueDate)
      .sort()[0];
    return {
      outstanding,
      pending,
      overdue,
      openOrders,
      openOrderValue: orders
        .filter((o) => o.status !== "Delivered")
        .reduce((sum, o) => sum + orderTotal(o), 0),
      nextDue: nextDue ?? null,
    };
  }, [invoices, orders]);

  /** Price rows for this account, with simulated updates folded in when toggled. */
  const priceRows = useMemo<PriceBookRow[]>(() => {
    const rows = priceBookFor(accountId);
    if (!simulatePriceUpdate) return rows;
    return rows.map((r) =>
      r.upcomingPrice != null && r.upcomingEffective
        ? {
            ...r,
            currentPrice: r.upcomingPrice,
            effective: r.upcomingEffective,
            upcomingPrice: null,
            upcomingEffective: null,
            history: [
              { effective: r.upcomingEffective, price: r.upcomingPrice, basis: r.basis },
              ...r.history,
            ],
          }
        : r,
    );
  }, [accountId, simulatePriceUpdate]);

  return {
    ...demo,
    account,
    roleDef,
    invoices,
    totals,
    priceRows,
    asOf: simulateStaleInventory ? "September 3, 2026 · 4:41 PM PT" : DEMO_AS_OF,
    todayLabel: DEMO_TODAY_LABEL,
  };
}

/** Availability for a product, respecting the stale-inventory simulation. */
export function availabilityFor(
  productId: string,
  stale: boolean,
): (InventorySnapshot & { stale: boolean }) | null {
  const snap = INVENTORY.find((i) => i.productId === productId);
  if (!snap) return null;
  return {
    ...snap,
    state: stale && snap.state === "Fresh" ? "Stale" : snap.state,
    asOf: stale ? "September 3, 2026 · 4:41 PM PT" : snap.asOf,
    stale,
  };
}

export const orderProgress = (order: DemoOrder) => {
  const requested = order.lines.reduce((n, l) => n + l.cases, 0);
  const shipped = order.lines.reduce((n, l) => n + l.casesShipped, 0);
  return {
    requested,
    shipped,
    remaining: requested - shipped,
    stage: ORDER_TIMELINE.indexOf(order.status),
  };
};

/** Triggers a browser download of text content. No network involved. */
export function downloadTextFile(filename: string, content: string, type = "text/csv") {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const csvCell = (value: string | number | null) => {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCsv = (rows: (string | number | null)[][]) =>
  rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
