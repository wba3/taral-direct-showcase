# Backend contract (developer notes)

Internal document. Nothing here is implemented as a live integration in this
prototype: operational behaviour is synthetic and browser-local, and the only
server data the app reads is the harvested public image/product index.

## Current state

| Concern | Today | Production requirement |
| --- | --- | --- |
| Public imagery + source listings | Cloud tables `site_assets`, `site_products`, public read policies, private storage bucket streamed through `/api/public/site-asset/*` | Unchanged, plus a curator step promoting a source listing to a sellable SKU |
| Accounts, prices, orders, invoices, payments, samples | `src/data/portal.ts` seeds + `localStorage` (`taral-direct-demo-v3`) | Acumatica is the system of record; portal reads through server functions |
| Auth | none; demo role selection is presentation state | Real authentication plus per-account server authorization |
| Image import (`runHarvest`) | disabled server-side, fails closed | Re-enable only behind authenticated Taral staff access |

`localStorage` is not an authorization boundary. The demo role only decides
which screens are offered.

## Typed adapter surface

The UI talks only to `src/lib/adapters/types.ts`. A production implementation
replaces `src/lib/adapters/mock.ts` and touches no component.

```
AcumaticaAdapter
  listProducts()                     -> Product[]
  getAccount(accountId)              -> DemoAccount | null
  listOrders(accountId)              -> DemoOrder[]
  listInvoices(accountId)            -> DemoInvoice[]
  listPriceBook(accountId)           -> PriceBookRow[]
  revalidateCart(accountId, lines)   -> CartCheck   // price + availability at review time
  submitSampleRequest(payload)       -> SampleRequestResult

PaymentsAdapter
  supportedMethods()                 -> ("card" | "ach")[]
  createPaymentIntent(request)       -> PaymentIntentResult
```

Every call would run inside `createServerFn` with
`.middleware([requireSupabaseAuth])`, and the account id would be derived from
the session, never accepted from the client.

## Table mapping

| Entity | Key columns | Ownership / access |
| --- | --- | --- |
| `accounts` | `id`, `erp_account_id`, `name`, `terms`, `price_class`, `case_minimum` | read: approved members of the account |
| `account_memberships` | `account_id`, `user_id`, `role` (`buyer`/`finance`/`admin`), `approved_at` | a membership row is the only grant of account data; self-insert is a request, not an approval |
| `products` | `id`, `code`, `category`, `status` (`source_listing`/`sellable`) | public read of `sellable` only |
| `product_variants` | `product_id`, `erp_inventory_id`, `each_per_case`, `neck_finish`, `thread_finish` | public read; closure compatibility requires matching thread finish, not diameter alone |
| `price_entries` | `account_id`, `variant_id`, `min_cases`, `currency`, `unit_price`, `effective_from`, `basis` | account members only; a row with a future `effective_from` must never be selected for today's order |
| `inventory_snapshots` | `variant_id`, `warehouse`, `available_cases`, `captured_at`, `state` | account members; snapshots inform, they never reserve |
| `sample_requests` | `reference`, `account_id` (nullable for guests), `idempotency_key` unique, `status`, `contact`, `items` | insert by anyone (rate limited + captcha); read by owner or staff |
| `sample_events` | `request_id`, `status`, `note`, `at` | append-only audit |
| `orders` / `order_lines` | `reference`, `account_id`, `po_number`, `idempotency_key` unique, `cases_requested`, `cases_shipped`, `unit_price_at_submit`, `line_status` | insert/read by account members; prices resolved server-side at submit |
| `invoices` | `erp_invoice_id`, `account_id`, `original_total`, `credit`, `due_date`, `discount_date` | read by account members; totals derive from applications, never stored as a display figure |
| `payment_attempts` | `invoice_id`, `idempotency_key` unique, `amount`, `outcome`, `processor_reference` | insert only via server function; no card or bank data ever stored |
| `payment_applications` | `attempt_id`, `invoice_id`, `amount`, `posted_at` | written when the ERP confirms application; a received-but-unapplied attempt has no row here |
| `integration_jobs` | `kind`, `payload`, `state`, `attempts`, `last_error` | staff only; the retry surface behind the operations queue |

## RLS design

- Every customer table carries `account_id`; policies join through
  `account_memberships` with `approved_at is not null` using a security-definer
  helper (`public.is_account_member(account_id, role)`), never a recursive
  subquery on the table itself.
- Roles live in `account_memberships` / a separate `user_roles` table, never on
  a profile row.
- Finance-only actions (payment attempts) require the `finance` role in the
  policy `with check`, and the amount is re-derived server-side from the
  invoice balance.
- Staff screens use a `has_role(auth.uid(), 'staff')` check; the demo role
  selector must not survive into production as a privilege source.
- `GRANT` statements accompany every table; `anon` gets select only on public
  product and asset tables.

## Payments position

Acumatica issues the invoice and remains the source of truth. The recommended
route is: Acumatica issues → Stripe (via the licensed Acumatica Stripe plug-in,
or a custom server-side collection) potentially collects → Acumatica applies the
payment. Invoice issuance is never duplicated in Stripe. Whether Acumatica's
native portal payment flow can be reused, and whether an arbitrary external
Stripe Checkout session can be matched back automatically, both need partner
validation in an ERP sandbox before either route is committed.
