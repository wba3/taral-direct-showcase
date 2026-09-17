# Bring the real Taral product line into Taral Direct

The four documents give us Taral's actual product range, real item codes, real dimensions,
the stocking program, and the minimum-order rules. The plan folds all of that into the
existing prototype, while keeping every price invented and clearly labeled — nothing
confidential goes on screen.

Scope is Taral only (jars, closures, PET covers, inserts, screen printing). The Hero
Packaging cannabis pages are left out. No PDF downloads are added.

## What changes

**1. Catalog replaced with the real range**

Today's catalog has 18 invented items. It becomes Taral's published line, using the real
size / neck / material / item-code structure from the price list and one-sheet:

- Regular (single) wall jars — 1/4 oz 33mm through 32 oz 120mm, in Crystal Clear PS,
  Clarified PP, Natural PP, White PP, Black PP where those are offered.
- Thick (heavy) wall jars — 1/8 oz 33mm through 12 oz 89mm.
- Double wall jars — round base, straight base, and in-mold frost, 1/4 oz to 8 oz.
- Closures — smooth side & top, ribbed, high smooth, and dome caps in 58mm, 70mm, 89mm
  and the smaller finishes, with liner options.
- Cosmetic PET dust covers / sealing discs — 48, 53, 58, 70, 89mm.
- LDPE jar inserts, and UV screen printing (1-3 colors) as an add-on program.

Each item carries its real max fill capacity, inside diameter, outside height, case count,
case weight, case dimensions, and base item code. Prices stay invented.

**2. Stocking program drives what can be ordered**

The pages 14-18 tables become real behaviour rather than decoration:

- Stocked items (checkmark) are orderable at a 1-case minimum, with the small-order fee
  noted when the order is under the $300 threshold.
- "CALL" items are not stocked: the catalog shows "Ask about overrun stock" and the item
  routes to a quote instead of the cart.
- Non-stock items show their MOQ (typically 25,000-100,000 each) and the $350 setup /
  colour-purge note, waived at the stated volume.
- Custom colour and PCR both show the 25,000-each minimum.

**3. Product pages gain the real technical content**

- Jar style comparison from the illustrations document: regular vs thick vs double wall
  (straight and round base), what each is typically used for, and which lid styles pair
  with which jar.
- Labeling guidance: 0.5-degree and 2-degree taper, why labels need an arc, and where a
  rectangular label will wrinkle.
- Material and compliance facts pulled from the one-sheet: BPA free, PFAS free, no
  bisphenols, FDA-compliant virgin materials, 100% recyclable, PCR up to 100% on jars and
  55% on closures.
- Lid compatibility on a product page is driven by the real pairing chart plus neck size,
  not just the neck match.

**4. Company facts on the public pages**

Home, About and Contact pick up the accurate details: 60+ years, family owned and operated,
Corona CA warehouse (525 Malloy Court), stock ships in about one business day, low MOQs and
short lead times, in-house UV silk screening 1-3 colours, and the "we mold to you" line.
The current Hayward address and any invented company claims are corrected.

**5. Pricing stays clearly invented**

- Every price keeps its existing "Demo data" / "Illustrative" tag, and the price book gains
  a plain note that the figures are placeholders and the real distributor list is separate
  and confidential.
- Specs, item codes, stock status and minimums get a "From Taral's published product data"
  tag so it is obvious which numbers are real and which are not.
- Account-specific demo pricing, tiers, and the order checks added in the last round keep
  working against the new catalog, with minimums now coming from the stocking program.

## Technical notes

- `src/data/products.ts` is regenerated from the parsed documents: the `Product` type gains
  `stockStatus` per material, `moq`, `setupFee`, `caseWeightLb`, `caseDims`, `freightClass`,
  `baseItemCode`, and `styleFamily`; `source` becomes `"published-specs" | "illustrative"`
  per field group so the labels stay accurate.
- Demo price book and inventory in `src/data/portal.ts` are re-keyed to the new product ids;
  `orderMinimumFor` folds in the stocking-program minimum alongside the account and tier
  minima.
- Catalog filters extend to material and jar style; existing routes, adapters, demo store,
  guided demo, and harvested site imagery stay as they are, with image matching remapped to
  the new ids.
- No database changes, no new dependencies, no publishing. Verified with type check,
  production build, and a focused browser pass over catalog filtering, a stocked vs CALL vs
  non-stock item, and order minimums per account.

## Out of scope

- Hero Packaging / cannabis products.
- Real distributor prices anywhere in the app.
- PDF downloads or a resources page.
- Acumatica connection, payments, emails.
