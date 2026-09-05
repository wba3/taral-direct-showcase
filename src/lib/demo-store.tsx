import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_ROLES,
  DEMO_TODAY,
  INVENTORY,
  INVOICES,
  SEED_ORDERS,
  getAccount,
  getRole,
  invoiceOutstanding,
  resolvePrice,
  type DemoOrder,
  type DemoRoleId,
} from "@/data/portal";

/**
 * All prototype state lives in this browser. It is a demonstration convenience,
 * not an authorization boundary: a real deployment authorizes every read and
 * write on the server against a signed-in user.
 */

export const SAMPLE_MAX_QTY = 12;
export const SAMPLE_MAX_LINES = 8;

/** Clamps any user-supplied number to a safe whole quantity. */
export function wholeQty(value: unknown, min: number, max: number) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

const rand = () => Math.random().toString(36).slice(2, 7).toUpperCase();

/** Collision-resistant reference for locally created records. */
export const newReference = (prefix: string) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${rand()}`;

export interface SampleLine {
  productId: string;
  code: string;
  name: string;
  qty: number;
  note: string;
}

export interface OrderDraftLine {
  productId: string;
  code: string;
  name: string;
  cases: number;
  /** Null when this account has no current price entry for the item. */
  unitPrice: number | null;
  eachPerCase: number;
  /** Price basis resolved at the moment the line was last priced. */
  priceBasis: string;
  priceEffective: string;
}

export type SampleStatus =
  | "Received"
  | "Approved"
  | "Queued for ERP"
  | "Synced (simulated)"
  | "Sync failed (simulated)"
  | "Shipped (simulated)";

export interface SampleEvent {
  at: string;
  text: string;
}

export interface SampleRequest {
  reference: string;
  idempotencyKey: string;
  /** Owning account, or null when submitted from the public site as a guest. */
  accountId: string | null;
  submittedAt: string;
  status: SampleStatus;
  contact: { company: string; name: string; email: string; phone: string; address: string };
  shipping: string;
  carrierAccount?: string;
  notes?: string;
  items: { productId: string; code: string; name: string; qty: number; note: string }[];
  events: SampleEvent[];
}

export type PaymentOutcome = "Applied" | "Declined" | "Received — ERP posting pending";

export interface PaymentAttempt {
  id: string;
  idempotencyKey: string;
  invoiceId: string;
  accountId: string;
  amount: number;
  at: string;
  outcome: PaymentOutcome;
  /** Set when a pending collection was later posted by staff. */
  postedAt?: string;
}

export interface InvoicePaymentState {
  /** Applied to the balance. */
  applied: number;
  /** Collected but not yet posted to the ERP. Blocks another charge. */
  pending: number;
}

export interface PaymentResult {
  ok: boolean;
  attempt: PaymentAttempt | null;
  message: string;
  duplicate?: boolean;
}

export interface OrderSubmitResult {
  ok: boolean;
  order: DemoOrder | null;
  errors: string[];
  duplicate?: boolean;
}

interface DemoState {
  role: DemoRoleId | null;
  accountId: string | null;
  samples: SampleLine[];
  draft: OrderDraftLine[];
  localOrders: DemoOrder[];
  sampleRequests: SampleRequest[];
  payments: Record<string, InvoicePaymentState>;
  attempts: PaymentAttempt[];
  /** Owner toggles shown only in Demo controls. */
  simulatePriceUpdate: boolean;
  simulateStaleInventory: boolean;
}

const EMPTY: DemoState = {
  role: null,
  accountId: null,
  samples: [],
  draft: [],
  localOrders: [],
  sampleRequests: [],
  payments: {},
  attempts: [],
  simulatePriceUpdate: false,
  simulateStaleInventory: false,
};

const KEY = "taral-direct-demo-v3";

const stamp = () => new Date().toISOString();

interface Ctx extends DemoState {
  hydrated: boolean;
  orders: DemoOrder[];
  addSample: (line: Omit<SampleLine, "qty" | "note"> & { qty?: number }) => boolean;
  updateSample: (productId: string, patch: Partial<SampleLine>) => void;
  removeSample: (productId: string) => void;
  clearSamples: () => void;
  addDraftLine: (line: {
    productId: string;
    code: string;
    name: string;
    eachPerCase: number;
    cases?: number;
    /** Fallback price when the account has no price-book entry. */
    unitPrice?: number | null;
  }) => void;
  updateDraft: (productId: string, cases: number) => void;
  removeDraft: (productId: string) => void;
  clearDraft: () => void;
  setRole: (role: DemoRoleId | null) => void;
  /** Explicit account selection, independent of the buyer/finance role. */
  setAccount: (accountId: string | null) => void;
  exitDemo: () => void;
  placeDraftOrder: (po: string, idempotencyKey: string) => OrderSubmitResult;
  reorder: (order: DemoOrder) => { added: number; merged: number; unpriced: number };
  submitSampleRequest: (
    input: Omit<SampleRequest, "reference" | "submittedAt" | "status" | "events">,
  ) => SampleRequest;
  advanceSample: (reference: string, status: SampleStatus, note: string) => void;
  recordPayment: (args: {
    invoiceId: string;
    amount: number;
    outcome: PaymentOutcome;
    idempotencyKey: string;
  }) => PaymentResult;
  postPending: (invoiceId: string) => PaymentResult;
  paymentFor: (invoiceId: string) => InvoicePaymentState;
  toggleSimulation: (key: "simulatePriceUpdate" | "simulateStaleInventory") => void;
  resetDemo: () => void;
}

const DemoContext = createContext<Ctx | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  /**
   * Mirror of the latest state. Handlers read and write through this so a
   * caller gets a truthful result immediately instead of waiting for React.
   */
  const ref = useRef<DemoState>(EMPTY);

  const commit = useCallback((updater: (s: DemoState) => DemoState) => {
    const next = updater(ref.current);
    ref.current = next;
    setState(next);
    return next;
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const merged = { ...EMPTY, ...(JSON.parse(raw) as DemoState) };
        ref.current = merged;
        setState(merged);
      }
    } catch {
      /* ignore corrupt demo state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — demo still works in memory */
    }
  }, [state, hydrated]);

  /* ── Samples basket ─────────────────────────────────────────────────── */

  const addSample = useCallback<Ctx["addSample"]>(
    (line) => {
      let ok = true;
      commit((s) => {
        const existing = s.samples.find((l) => l.productId === line.productId);
        if (existing) {
          return {
            ...s,
            samples: s.samples.map((l) =>
              l.productId === line.productId
                ? { ...l, qty: wholeQty(l.qty + wholeQty(line.qty ?? 1, 1, SAMPLE_MAX_QTY), 1, SAMPLE_MAX_QTY) }
                : l,
            ),
          };
        }
        if (s.samples.length >= SAMPLE_MAX_LINES) {
          ok = false;
          return s;
        }
        return {
          ...s,
          samples: [
            ...s.samples,
            { ...line, qty: wholeQty(line.qty ?? 1, 1, SAMPLE_MAX_QTY), note: "" },
          ],
        };
      });
      return ok;
    },
    [commit],
  );

  const updateSample = useCallback<Ctx["updateSample"]>(
    (productId, patch) => {
      commit((s) => ({
        ...s,
        samples: s.samples.map((l) =>
          l.productId === productId
            ? {
                ...l,
                ...patch,
                qty:
                  patch.qty === undefined
                    ? l.qty
                    : wholeQty(patch.qty, 1, SAMPLE_MAX_QTY),
              }
            : l,
        ),
      }));
    },
    [commit],
  );

  const removeSample = useCallback(
    (productId: string) =>
      commit((s) => ({ ...s, samples: s.samples.filter((l) => l.productId !== productId) })),
    [commit],
  );

  const clearSamples = useCallback(() => commit((s) => ({ ...s, samples: [] })), [commit]);

  /* ── Order draft ────────────────────────────────────────────────────── */

  /** Reprices a single line at its final quantity for the current account. */
  const priceLine = (
    accountId: string | null,
    line: OrderDraftLine,
    fallback: number | null,
  ): OrderDraftLine => {
    const row = resolvePrice(accountId, line.productId, line.cases);
    if (row) {
      return {
        ...line,
        unitPrice: row.currentPrice,
        priceBasis: `${row.basis} · ${row.minCases}+ cases`,
        priceEffective: row.effective,
      };
    }
    return {
      ...line,
      unitPrice: fallback,
      priceBasis: fallback == null ? "No current price entry" : "Reference price",
      priceEffective: "",
    };
  };

  const addDraftLine = useCallback<Ctx["addDraftLine"]>(
    (line) => {
      commit((s) => {
        const add = wholeQty(line.cases ?? 1, 1, 9999);
        const idx = s.draft.findIndex((l) => l.productId === line.productId);
        if (idx >= 0) {
          const existing = s.draft[idx]!;
          const merged = { ...existing, cases: wholeQty(existing.cases + add, 1, 9999) };
          const next = [...s.draft];
          next[idx] = priceLine(s.accountId, merged, line.unitPrice ?? existing.unitPrice);
          return { ...s, draft: next };
        }
        const fresh: OrderDraftLine = {
          productId: line.productId,
          code: line.code,
          name: line.name,
          eachPerCase: line.eachPerCase,
          cases: add,
          unitPrice: line.unitPrice ?? null,
          priceBasis: "",
          priceEffective: "",
        };
        return {
          ...s,
          draft: [...s.draft, priceLine(s.accountId, fresh, line.unitPrice ?? null)],
        };
      });
    },
    [commit],
  );

  /** Re-resolves the demo price whenever the case quantity crosses a break. */
  const updateDraft = useCallback(
    (productId: string, cases: number) => {
      commit((s) => ({
        ...s,
        draft: s.draft.map((l) =>
          l.productId === productId
            ? priceLine(s.accountId, { ...l, cases: wholeQty(cases, 1, 9999) }, l.unitPrice)
            : l,
        ),
      }));
    },
    [commit],
  );

  const removeDraft = useCallback(
    (productId: string) =>
      commit((s) => ({ ...s, draft: s.draft.filter((l) => l.productId !== productId) })),
    [commit],
  );

  const clearDraft = useCallback(() => commit((s) => ({ ...s, draft: [] })), [commit]);

  /* ── Role and account selection ─────────────────────────────────────── */

  const setAccount = useCallback<Ctx["setAccount"]>(
    (accountId) => {
      commit((s) =>
        s.accountId === accountId
          ? s
          : { ...s, accountId, draft: [], samples: [] },
      );
    },
    [commit],
  );

  /**
   * Selecting a role rescopes the session. Taral staff are not scoped to an
   * account; customer roles land on their own default account. Any draft or
   * sample basket built for another account is cleared, never carried over.
   */
  const setRole = useCallback<Ctx["setRole"]>(
    (role) => {
      const def = role ? getRole(role) : null;
      commit((s) => {
        const nextAccount = def ? def.accountId : null;
        const changed = nextAccount !== s.accountId;
        return {
          ...s,
          role,
          accountId: nextAccount,
          draft: changed ? [] : s.draft,
          samples: changed ? [] : s.samples,
        };
      });
    },
    [commit],
  );

  const exitDemo = useCallback(
    () => commit((s) => ({ ...s, role: null, accountId: null, draft: [] })),
    [commit],
  );

  /* ── Orders ─────────────────────────────────────────────────────────── */

  const placeDraftOrder = useCallback<Ctx["placeDraftOrder"]>(
    (po, idempotencyKey) => {
      const s = ref.current;
      const account = getAccount(s.accountId);
      if (!account) return { ok: false, order: null, errors: ["Select a demo account first."] };

      const duplicate = s.localOrders.find((o) => o.po === po && o.idempotencyKey === idempotencyKey);
      if (duplicate) return { ok: true, order: duplicate, errors: [], duplicate: true };

      const errors: string[] = [];
      if (s.draft.length === 0) errors.push("The draft is empty.");
      if (!po.trim()) errors.push("A purchase-order reference is required.");

      for (const line of s.draft) {
        if (!Number.isInteger(line.cases) || line.cases < 1) {
          errors.push(`${line.code}: order in whole cases.`);
        }
        if (line.cases < account.caseMinimum) {
          errors.push(`${line.code}: minimum ${account.caseMinimum} case(s) for this account.`);
        }
        if (line.unitPrice == null) {
          errors.push(`${line.code}: no current price for this account — request a quote.`);
        }
        const snap = INVENTORY.find((i) => i.productId === line.productId);
        if (!snap) {
          errors.push(`${line.code}: availability unknown — request details.`);
        } else if (snap.state === "Unavailable" || snap.availableCases === 0) {
          errors.push(`${line.code}: not currently available to sell.`);
        } else if (s.simulateStaleInventory) {
          errors.push(`${line.code}: availability snapshot is stale — revalidate before submitting.`);
        } else if (snap.availableCases < line.cases) {
          errors.push(
            `${line.code}: only ${snap.availableCases} case(s) available, ${line.cases} requested.`,
          );
        }
      }

      if (errors.length > 0) return { ok: false, order: null, errors };

      const order: DemoOrder = {
        id: newReference("SO-D"),
        idempotencyKey,
        accountId: account.id,
        po: po.trim(),
        date: DEMO_TODAY,
        status: "Submitted",
        shipment: "Not yet released (simulated)",
        tracking: null,
        lines: s.draft.map((l) => ({
          productId: l.productId,
          code: l.code,
          description: l.name,
          cases: l.cases,
          casesShipped: 0,
          eachPerCase: l.eachPerCase,
          unitPrice: l.unitPrice ?? 0,
          lineStatus: "Awaiting release" as const,
        })),
      };
      commit((cur) => ({ ...cur, localOrders: [order, ...cur.localOrders], draft: [] }));
      return { ok: true, order, errors: [] };
    },
    [commit],
  );

  /**
   * Reorder never reuses historical pricing: every line is repriced at its
   * final merged quantity against today's demo price book.
   */
  const reorder = useCallback<Ctx["reorder"]>(
    (order) => {
      let added = 0;
      let merged = 0;
      let unpriced = 0;
      commit((s) => {
        let next = [...s.draft];
        for (const line of order.lines) {
          const idx = next.findIndex((l) => l.productId === line.productId);
          if (idx >= 0) {
            merged += 1;
            next[idx] = { ...next[idx]!, cases: next[idx]!.cases + line.cases };
          } else {
            added += 1;
            next.push({
              productId: line.productId,
              code: line.code,
              name: line.description,
              cases: line.cases,
              unitPrice: null,
              eachPerCase: line.eachPerCase,
              priceBasis: "",
              priceEffective: "",
            });
          }
        }
        next = next.map((l) => priceLine(s.accountId, l, null));
        unpriced = next.filter((l) => l.unitPrice == null).length;
        return { ...s, draft: next };
      });
      return { added, merged, unpriced };
    },
    [commit],
  );

  /* ── Sample requests ────────────────────────────────────────────────── */

  const submitSampleRequest = useCallback<Ctx["submitSampleRequest"]>(
    (input) => {
      const existing = ref.current.sampleRequests.find(
        (r) => r.idempotencyKey === input.idempotencyKey,
      );
      if (existing) return existing;
      const at = stamp();
      const request: SampleRequest = {
        ...input,
        items: input.items.map((i) => ({ ...i, qty: wholeQty(i.qty, 1, SAMPLE_MAX_QTY) })),
        reference: newReference("SMP"),
        submittedAt: at,
        status: "Received",
        events: [{ at, text: "Request received in the prototype queue (simulated)." }],
      };
      commit((s) =>
        s.sampleRequests.some((r) => r.idempotencyKey === input.idempotencyKey)
          ? s
          : { ...s, sampleRequests: [request, ...s.sampleRequests], samples: [] },
      );
      return request;
    },
    [commit],
  );

  const advanceSample = useCallback<Ctx["advanceSample"]>(
    (reference, status, note) => {
      commit((s) => ({
        ...s,
        sampleRequests: s.sampleRequests.map((r) =>
          r.reference === reference
            ? { ...r, status, events: [...r.events, { at: stamp(), text: note }] }
            : r,
        ),
      }));
    },
    [commit],
  );

  /* ── Payments ───────────────────────────────────────────────────────── */

  const recordPayment = useCallback<Ctx["recordPayment"]>(
    ({ invoiceId, amount, outcome, idempotencyKey }) => {
      const s = ref.current;
      const prior = s.attempts.find((a) => a.idempotencyKey === idempotencyKey);
      if (prior) {
        return {
          ok: prior.outcome !== "Declined",
          attempt: prior,
          duplicate: true,
          message: "This collection was already recorded — nothing was charged again.",
        };
      }

      const invoice = INVOICES.find((i) => i.id === invoiceId);
      if (!invoice) return { ok: false, attempt: null, message: "Unknown invoice." };
      if (invoice.accountId !== s.accountId) {
        return { ok: false, attempt: null, message: "That invoice belongs to another account." };
      }

      const current = s.payments[invoiceId] ?? { applied: 0, pending: 0 };
      if (current.pending > 0) {
        return {
          ok: false,
          attempt: null,
          message: "A collection is already received and waiting to post. Staff must finish it first.",
        };
      }
      const outstanding = invoiceOutstanding(invoice, current.applied);
      if (outstanding <= 0) {
        return { ok: false, attempt: null, message: "This invoice has no outstanding balance." };
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, attempt: null, message: "Enter an amount greater than zero." };
      }
      if (amount > outstanding + 0.005) {
        return {
          ok: false,
          attempt: null,
          message: "The amount is larger than the outstanding balance.",
        };
      }

      const attempt: PaymentAttempt = {
        id: newReference("PAY"),
        idempotencyKey,
        invoiceId,
        accountId: invoice.accountId,
        amount: Math.round(amount * 100) / 100,
        at: stamp(),
        outcome,
      };

      commit((cur) => {
        const state0 = cur.payments[invoiceId] ?? { applied: 0, pending: 0 };
        const next =
          outcome === "Applied"
            ? { applied: state0.applied + attempt.amount, pending: 0 }
            : outcome === "Received — ERP posting pending"
              ? { ...state0, pending: attempt.amount }
              : state0;
        return {
          ...cur,
          payments: { ...cur.payments, [invoiceId]: next },
          attempts: [attempt, ...cur.attempts],
        };
      });

      return {
        ok: outcome !== "Declined",
        attempt,
        message:
          outcome === "Applied"
            ? "Simulated payment applied to the balance."
            : outcome === "Declined"
              ? "The simulated processor declined this collection. Nothing was charged."
              : "Collected in the simulation but not yet posted to the ERP.",
      };
    },
    [commit],
  );

  /**
   * Finishes a received-but-unposted collection. This updates the original
   * attempt rather than creating a second charge, and is safe to call twice.
   */
  const postPending = useCallback<Ctx["postPending"]>(
    (invoiceId) => {
      const s = ref.current;
      const current = s.payments[invoiceId];
      if (!current || current.pending <= 0) {
        return { ok: true, attempt: null, message: "Nothing is pending for this invoice." };
      }
      const target = s.attempts.find(
        (a) => a.invoiceId === invoiceId && a.outcome === "Received — ERP posting pending",
      );
      const postedAt = stamp();
      commit((cur) => {
        const st = cur.payments[invoiceId];
        if (!st || st.pending <= 0) return cur;
        return {
          ...cur,
          payments: {
            ...cur.payments,
            [invoiceId]: { applied: st.applied + st.pending, pending: 0 },
          },
          attempts: cur.attempts.map((a) =>
            a.id === target?.id ? { ...a, outcome: "Applied" as const, postedAt } : a,
          ),
        };
      });
      return {
        ok: true,
        attempt: target ? { ...target, outcome: "Applied", postedAt } : null,
        message: "Posting retried — the existing collection is now applied to the balance.",
      };
    },
    [commit],
  );

  const paymentFor = useCallback(
    (invoiceId: string) => state.payments[invoiceId] ?? { applied: 0, pending: 0 },
    [state.payments],
  );

  const toggleSimulation = useCallback<Ctx["toggleSimulation"]>(
    (key) => commit((s) => ({ ...s, [key]: !s[key] })),
    [commit],
  );

  const resetDemo = useCallback(() => {
    ref.current = EMPTY;
    setState(EMPTY);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* nothing to clear */
    }
  }, []);

  const orders = useMemo(() => {
    if (!state.accountId) return [];
    return [...state.localOrders, ...SEED_ORDERS].filter((o) => o.accountId === state.accountId);
  }, [state.accountId, state.localOrders]);

  const value: Ctx = {
    ...state,
    hydrated,
    orders,
    addSample,
    updateSample,
    removeSample,
    clearSamples,
    addDraftLine,
    updateDraft,
    removeDraft,
    clearDraft,
    setRole,
    setAccount,
    exitDemo,
    placeDraftOrder,
    reorder,
    submitSampleRequest,
    advanceSample,
    recordPayment,
    postPending,
    paymentFor,
    toggleSimulation,
    resetDemo,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
  return ctx;
}

export const ROLE_OPTIONS = DEMO_ROLES;
