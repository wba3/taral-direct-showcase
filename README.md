# Taral Direct Portal

Build a polished, responsive, meeting-ready working prototype for Taral Plastics called “Taral Direct.”

CONTEXT
Taral Plastics is a 60+ year plastic packaging manufacturer. The current public site is https://taralplastics.com/. Use it only as a factual/content reference and for accessible public brand assets if available; do not clone its dated layout. This prototype will be demonstrated to the owner in two weeks to show what a modern AI-built public site and distributor self-service portal could do. No live Acumatica, Supabase, or Stripe systems are connected yet. Every operational number and transaction must be visibly labeled “Demo data” or “Illustrative.” Never imply a live integration.

AUDIENCE AND ACTIONS
Public audience: packaging buyers who need to find compatible jars/closures and request samples.
Distributor audience: buyers and accounts-payable users who need private pricing, inventory, orders, invoices, and payment access.
Primary public action: Find the right container and request samples.
Primary distributor action: Enter the demo portal and self-serve.

DESIGN DIRECTION
Use Hallmark-quality anti-generic design:
- Genre: industrial editorial + technical product workbench.
- Public macrostructure: asymmetric product canvas with an anchored search/specification inspector.
- Portal macrostructure: focused command center with a quiet action rail.
- Derive the anchor hue from Taral’s current logo/site. Use restrained industrial neutrals and at most one useful accent.
- Typography: Archivo for display/labels and Source Sans 3 for body/interface, or an equally intentional industrial pairing.
- Use technical linework, container silhouettes, specification notation, large product photography, and generous negative space.
- No purple/pink gradients, glassmorphism, fake browser chrome, giant rounded cards, generic three-card feature grids, ambient animation, fake testimonials, customer logos, or invented business metrics.
- Add the Hallmark delivery comment near the top of the main stylesheet.
- Responsive at 320, 375, 414, 768, and desktop; semantic HTML, keyboard navigation, visible focus, reduced motion.
- Keep the interface credible and calm enough for a mature manufacturer.

GLOBAL PROTOTYPE BEHAVIOR
- A discreet persistent banner: “Interactive prototype · Demo data · No live systems connected.”
- All actions work locally with mock data and localStorage; no external side effects.
- Provide a “Guided demo” control that highlights, in order: product finder, sample cart, distributor portal, private price book, invoices/payments, and integration blueprint.
- Create service adapter interfaces for Acumatica and payments, backed by mock implementations, so a future engineer can swap in real APIs without rewriting UI.
- Keep mock data in dedicated typed data files.
- Do not enable real payments or request payment credentials.

ROUTES AND EXPERIENCES

1) PUBLIC HOME /
Create a left-aligned editorial hero with honest copy. Suggested headline: “Packaging that fits the product—and the business behind it.”
Include:
- Search by volume, neck finish, item code, or category.
- Category rail: Regular Wall Jars, Thick Wall Jars, Double Wall Jars, Lids & Closures, Discs & Dust Covers, Add-ons.
- Honest proof from the current site only: over 60 years’ experience; stocked items generally ship within one business day; samples available on request.
- A compact “How Taral works” path: Find → Sample → Specify → Order.
- Clear “Browse catalog,” “Request samples,” and “Distributor sign in” actions.

2) CATALOG /catalog
A real interactive product workbench:
- Filters: category, nominal fill volume, neck finish/diameter, color/material, stocking status.
- Search, filter chips only when active, grid/list toggle, useful empty state.
- Cards show product silhouette/image, item code, size, neck finish, case count, availability, and pricing state.
- Public users see “Public list price” only where supplied and “Request quote” elsewhere.
- Use these factual current-site examples:
  * 1/4 oz 33mm Regular Wall White Polypropylene; item code 1/4-33-RW-WPPT; white polypropylene #5 PP; 33mm-400; $0.07/item; 2,000/case; $148/case; in stock; overstock; height 1.17 in; opening 1.06 in; max fill 14 ml.
  * Product families and sizes from 1/8 oz through 32 oz.
- Add at least 12 realistic demo products spanning jars, closures, discs, and add-ons. Any invented price or inventory value must carry an “Illustrative” marker.

3) PRODUCT DETAIL /product/:id
- Strong product imagery/silhouette and specification-first layout.
- Item code, material/color, volume, thread finish, case count, availability, shipping specs, technical drawing control, and matching closures.
- “Add to sample request” primary action.
- “Request quote” for custom colors/printing.
- Compatibility suggestions based on matching neck finish.

4) SAMPLE CART /samples
A functioning sample cart:
- Add/remove items, quantities, and notes.
- Contact and shipping form.
- Shipping choices: complimentary ground within North America; expedited using a customer-provided UPS/FedEx account.
- Clear prototype note.
- Mock submit confirmation: “Sample request SMP-1048 received.”
- After confirmation, show the future system actions: match/create Acumatica contact, create sample fulfillment record, alert customer service.
- Do not actually submit or transmit data.

5) DEMO PORTAL /portal
No real authentication. Provide a one-click control: “Enter demo as Meridian Labs.”
After entry show:
- Customer: Meridian Labs · Demo account D-1042.
- Open orders: 3.
- Open invoices: $18,420.
- Next payment due: September 15, 2026.
- These must be marked Demo data.
- Alerts: private price-book update effective September 1; one order awaiting shipment.
- Fast actions: Reorder, Browse private catalog, Download price book, View invoices.
- Persistent portal navigation: Overview, Catalog, Orders, Invoices, Price Book, Account.
- Users must never see another customer’s simulated data.

6) PRIVATE CATALOG /portal/catalog
- Same product experience, now showing “Your price” beside public/list price.
- Quantity breaks, UOM/case counts, available-to-sell, warehouse summary, and “As of” timestamp.
- Add standard stocked products to a demo order.
- Custom items go to quote request.
- Revalidate price/inventory message at review step.

7) ORDERS /portal/orders
- Orders table and detail drawer/page with PO number, date, status, shipment status, tracking placeholder, totals, and line items.
- Reorder action works locally.
- Status timeline with Submitted, Confirmed, In production, Shipped, Delivered.
- Include three realistic demo orders with differing states.

8) INVOICES /portal/invoices
- Open/paid/overdue filters.
- Invoice number, order reference, issue date, discount date, due date, original total, remaining balance, status.
- Invoice detail with line items and a mock PDF/download action.
- “Pay now” opens a clearly labeled demo modal with selectable Card / ACH presentation, but no fields collecting real financial details and no transaction.
- Mock success state explains: Stripe/Acumatica processor confirms payment → Acumatica applies it to AR → settlement is reconciled.
- Include partial-payment/dispute copy as a future capability; do not fake a completed financial transaction.

9) PRICE BOOK /portal/price-book
- Searchable table with SKU, description, UOM, minimum quantity, prior price, current price, effective date, and change indicator.
- Price history drawer.
- Simulated CSV download.
- Clear distinction among public list price, customer price class, and customer-specific override.
- Show “Acumatica will remain the source of truth.”

10) ACCOUNT /portal/account
- Company and contact information, shipping locations, payment terms, saved payment-method placeholder, portal users and roles.
- Roles: Customer Admin, Buyer, Accounts Payable.
- All edits remain local in demo mode.

11) INTEGRATION BLUEPRINT /integration
This is a buyer/owner-friendly explainer, not a developer code screen:
- Flow: Lovable public experience → secure integration service → Acumatica system of record.
- Acumatica owns products, price classes, inventory, orders, invoices, terms, balances.
- Stripe/Acumatica Payments owns payment processing and settlement.
- Optional middleware: Supabase Edge Functions or lightweight API service for secure requests/caching; Zapier only for notifications and low-risk workflow automation, not authoritative pricing, inventory, orders, or payments.
- Show current status labels: “Prototype mock,” “API contract needed,” and “Ready for engineer validation.”
- Include a phased implementation path: validate Acumatica features; connect read-only catalog/price/inventory; add samples/contact sync; add order writes; add payments/reconciliation.
- Add a small “Ownership standard” section: Taral owns domain, repo, Lovable workspace, backend, connected app, and payment account.

FOOTER / LEGAL
- Taral Plastics name and current contact information: sales@taralplastics.com and (510) 972-6300.
- Mark the experience “Concept prototype—not a production system.”
- Do not discuss or display the current vendor relationship, historic website spend, or outstanding invoices anywhere in the customer-facing prototype.

IMPLEMENTATION QUALITY
- Full-stack TypeScript app using the project’s default Lovable stack, Tailwind, and shadcn/ui where appropriate.
- Keep components purposeful; avoid repeating card grids.
- Use routed pages, real filtering, local cart/order state, toasts, dialogs, accessible tables/drawers, and useful responsive states.
- Critique before completing: Philosophy, Hierarchy, Execution, Specificity, Restraint, Variety. Revise anything under 3/5.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e05ea5c7-4e50-450f-bb83-943a17f22f62).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
