/**
 * Locally generated invoice document.
 *
 * The HTML below is built in the browser from demo state and either printed
 * (use the browser's "Save as PDF") or saved as a file. Nothing is fetched and
 * every copy is stamped DEMO so it can never be mistaken for a real invoice.
 */

import { DEMO_TODAY_LABEL, type DemoAccount, type DemoInvoice } from "@/data/portal";
import type { InvoiceView } from "@/lib/portal-view";

const esc = (s: string | number) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

export function invoiceDocument(view: InvoiceView, account: DemoAccount) {
  const inv: DemoInvoice = view.invoice;
  const rows = inv.lines
    .map(
      (l) =>
        `<tr><td>${esc(l.description)}</td><td class="n">${esc(l.qty)}</td><td class="n">${usd(l.amount)}</td></tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>DEMO invoice ${esc(inv.id)} — Taral Direct</title>
<style>
  @page { margin: 18mm; }
  * { box-sizing: border-box; }
  body { font: 13px/1.5 "Source Sans 3", system-ui, sans-serif; color: #14213d; margin: 0; padding: 24px; }
  .stamp { border: 2px solid #d1621a; color: #d1621a; display: inline-block; padding: 4px 10px;
    font: 700 11px/1 system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; }
  h1 { font: 700 24px/1.2 system-ui, sans-serif; margin: 14px 0 2px; }
  .muted { color: #5b6478; }
  .grid { display: flex; flex-wrap: wrap; gap: 32px; margin: 20px 0; }
  .grid section { min-width: 200px; }
  h2 { font: 700 10px/1 system-ui, sans-serif; letter-spacing: .12em; text-transform: uppercase;
    color: #5b6478; margin: 0 0 6px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { text-align: left; padding: 7px 8px; border-bottom: 1px solid #d8dce6; }
  th { font: 700 10px/1 system-ui, sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #5b6478; }
  td.n, th.n { text-align: right; font-variant-numeric: tabular-nums; }
  .totals { margin-top: 14px; margin-left: auto; width: 300px; }
  .totals div { display: flex; justify-content: space-between; padding: 5px 0; }
  .totals .due { border-top: 2px solid #14213d; font-weight: 700; font-size: 16px; }
  footer { margin-top: 28px; border-top: 1px solid #d8dce6; padding-top: 12px; font-size: 11px; color: #5b6478; }
</style></head>
<body>
  <span class="stamp">Demo document · not a real invoice</span>
  <h1>Invoice ${esc(inv.id)}</h1>
  <p class="muted">Taral Plastics · Taral Direct account service · Generated ${esc(DEMO_TODAY_LABEL)} (demo business date)</p>

  <div class="grid">
    <section><h2>Billed to</h2>${esc(account.name)}<br />Account ${esc(account.id)}<br />Terms ${esc(account.terms)}</section>
    <section><h2>Dates</h2>Issued ${esc(inv.issueDate)}<br />Early-pay discount by ${esc(inv.discountDate)}<br />Due ${esc(inv.dueDate)}</section>
    <section><h2>Reference</h2>Order ${esc(inv.orderRef)}<br />Status ${esc(view.status)}</section>
  </div>

  <table>
    <thead><tr><th>Description</th><th class="n">Quantity</th><th class="n">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>Original total</span><span>${usd(inv.originalTotal)}</span></div>
    <div><span>Credit applied</span><span>-${usd(view.credit)}</span></div>
    <div><span>Payments applied</span><span>-${usd(view.paid)}</span></div>
    ${view.pending > 0 ? `<div><span>Received, not yet posted</span><span>${usd(view.pending)}</span></div>` : ""}
    <div class="due"><span>Outstanding</span><span>${usd(view.outstanding)}</span></div>
  </div>

  <footer>
    Every figure on this page is synthetic demo data produced by the Taral Direct prototype in the
    reader's browser. Acumatica remains the commercial source of truth; no accounting system was
    read or written, and no payment was processed.
  </footer>
</body></html>`;
}

/** Opens the browser print dialog on a locally built document. */
export function printInvoice(view: InvoiceView, account: DemoAccount) {
  const html = invoiceDocument(view, account);
  const frame = document.createElement("iframe");
  frame.setAttribute("title", `Print demo invoice ${view.invoice.id}`);
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc) {
    frame.remove();
    return false;
  }
  doc.open();
  doc.write(html);
  doc.close();
  const win = frame.contentWindow;
  if (!win) {
    frame.remove();
    return false;
  }
  win.focus();
  win.print();
  window.setTimeout(() => frame.remove(), 1500);
  return true;
}
