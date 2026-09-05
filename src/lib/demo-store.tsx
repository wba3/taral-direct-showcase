import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_ROLES,
  SEED_ORDERS,
  getRole,
  resolvePrice,
  type DemoOrder,
  type DemoRoleId,
} from "@/data/portal";

/**
 * All prototype state lives in this browser. It is a demonstration convenience,
 * not an authorization boundary: a real deployment authorizes every read and
 * write on the server against a signed-in user.
 */

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
  unitPrice: number;
  eachPerCase: number;
  /** Price basis resolved at the moment the line was priced. */
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
  submittedAt: string;
  status: SampleStatus;
  contact: { company: string; name: string; email: string; phone: string; address: string };
  shipping: string;
  carrierAccount?: string;
  notes?: string;
  items: { productId: string; code: string; name: string; qty: number; note: string }[];
  events: SampleEvent[];
}

export interface PaymentAttempt {
  id: string;
  invoiceId: string;
  amount: number;
  at: string;
  outcome: "Applied" | "Declined" | "Received — ERP posting pending";
}

export interface InvoicePaymentState {
  /** Applied to the balance. */
  applied: number;
  /** Collected but not yet posted to the ERP. Blocks another charge. */
  pending: number;
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

const KEY = "taral-direct-demo-v2";

const stamp = () => new Date().toISOString();

interface Ctx extends DemoState {
  hydrated: boolean;
  orders: DemoOrder[];
  addSample: (line: Omit<SampleLine, "qty" | "note"> & { qty?: number }) => void;
  updateSample: (productId: string, patch: Partial<SampleLine>) => void;
  removeSample: (productId: string) => void;
  clearSamples: () => void;
  addDraftLine: (line: Omit<OrderDraftLine, "cases" | "priceBasis" | "priceEffective"> & {
    cases?: number;
    priceBasis?: string;
    priceEffective?: string;
  }) => void;
  updateDraft: (productId: string, cases: number) => void;
  removeDraft: (productId: string) => void;
  clearDraft: () => void;
  setRole: (role: DemoRoleId | null) => void;
  exitDemo: () => void;
  placeDraftOrder: (po: string) => DemoOrder | null;
  reorder: (order: DemoOrder) => { added: number; repriced: number };
  submitSampleRequest: (
    input: Omit<SampleRequest, "reference" | "submittedAt" | "status" | "events">,
  ) => SampleRequest;
  advanceSample: (reference: string, status: SampleStatus, note: string) => void;
  recordPayment: (
    invoiceId: string,
    amount: number,
    outcome: PaymentAttempt["outcome"],
  ) => PaymentAttempt;
  postPending: (invoiceId: string) => void;
  paymentFor: (invoiceId: string) => InvoicePaymentState;
  toggleSimulation: (key: "simulatePriceUpdate" | "simulateStaleInventory") => void;
  resetDemo: () => void;
}

const DemoContext = createContext<Ctx | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as DemoState) });
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

  const addSample = useCallback<Ctx["addSample"]>((line) => {
    setState((s) => {
      const existing = s.samples.find((l) => l.productId === line.productId);
      if (existing) {
        return {
          ...s,
          samples: s.samples.map((l) =>
            l.productId === line.productId
              ? { ...l, qty: Math.min(12, l.qty + (line.qty ?? 1)) }
              : l,
          ),
        };
      }
      return { ...s, samples: [...s.samples, { ...line, qty: line.qty ?? 1, note: "" }] };
    });
  }, []);

  const updateSample = useCallback<Ctx["updateSample"]>((productId, patch) => {
    setState((s) => ({
      ...s,
      samples: s.samples.map((l) => (l.productId === productId ? { ...l, ...patch } : l)),
    }));
  }, []);

  const removeSample = useCallback((productId: string) => {
    setState((s) => ({ ...s, samples: s.samples.filter((l) => l.productId !== productId) }));
  }, []);

  const clearSamples = useCallback(() => setState((s) => ({ ...s, samples: [] })), []);

  const addDraftLine = useCallback<Ctx["addDraftLine"]>((line) => {
    setState((s) => {
      const existing = s.draft.find((l) => l.productId === line.productId);
      if (existing) {
        return {
          ...s,
          draft: s.draft.map((l) =>
            l.productId === line.productId ? { ...l, cases: l.cases + (line.cases ?? 1) } : l,
          ),
        };
      }
      return {
        ...s,
        draft: [
          ...s.draft,
          {
            ...line,
            cases: line.cases ?? 1,
            priceBasis: line.priceBasis ?? "Price class",
            priceEffective: line.priceEffective ?? "",
          },
        ],
      };
    });
  }, []);

  /** Re-resolves the demo price whenever the case quantity crosses a break. */
  const updateDraft = useCallback((productId: string, cases: number) => {
    setState((s) => {
      const whole = Math.max(1, Math.floor(cases));
      return {
        ...s,
        draft: s.draft.map((l) => {
          if (l.productId !== productId) return l;
          const row = resolvePrice(s.accountId, productId, whole);
          return row
            ? {
                ...l,
                cases: whole,
                unitPrice: row.currentPrice,
                priceBasis: row.basis,
                priceEffective: row.effective,
              }
            : { ...l, cases: whole };
        }),
      };
    });
  }, []);

  const removeDraft = useCallback((productId: string) => {
    setState((s) => ({ ...s, draft: s.draft.filter((l) => l.productId !== productId) }));
  }, []);

  const clearDraft = useCallback(() => setState((s) => ({ ...s, draft: [] })), []);

  /** Switching roles rescopes the session and clears account-scoped work. */
  const setRole = useCallback((role: DemoRoleId | null) => {
    const def = role ? (getRole(role) ?? null) : null;
    setState((s) => ({
      ...s,
      role,
      accountId: def?.accountId ?? null,
      draft: [],
    }));
  }, []);

  const exitDemo = useCallback(() => {
    setState((s) => ({ ...s, role: null, accountId: null, draft: [] }));
  }, []);

  const placeDraftOrder = useCallback<Ctx["placeDraftOrder"]>(
    (po) => {
      if (!state.accountId || state.draft.length === 0) return null;
      const order: DemoOrder = {
        id: `SO-D${String(Date.now()).slice(-5)}`,
        accountId: state.accountId,
        po: po || "DEMO-PO",
        date: new Date().toISOString().slice(0, 10),
        status: "Submitted",
        shipment: "Not yet released (simulated)",
        tracking: null,
        lines: state.draft.map((l) => ({
          productId: l.productId,
          code: l.code,
          description: l.name,
          cases: l.cases,
          casesShipped: 0,
          eachPerCase: l.eachPerCase,
          unitPrice: l.unitPrice,
          lineStatus: "Awaiting release" as const,
        })),
      };
      setState((s) => ({ ...s, localOrders: [order, ...s.localOrders], draft: [] }));
      return order;
    },
    [state.accountId, state.draft],
  );

  /** Reorder always reprices against today's demo price book. */
  const reorder = useCallback<Ctx["reorder"]>((order) => {
    let repriced = 0;
    let added = 0;
    setState((s) => {
      const next = [...s.draft];
      for (const line of order.lines) {
        const cases = line.cases;
        const row = resolvePrice(s.accountId, line.productId, cases);
        const unitPrice = row?.currentPrice ?? line.unitPrice;
        if (row && row.currentPrice !== line.unitPrice) repriced += 1;
        const idx = next.findIndex((l) => l.productId === line.productId);
        const existing = idx >= 0 ? next[idx] : undefined;
        if (existing) {
          next[idx] = { ...existing, cases: existing.cases + cases, unitPrice };
        } else {
          added += 1;
          next.push({
            productId: line.productId,
            code: line.code,
            name: line.description,
            cases,
            unitPrice,
            eachPerCase: line.eachPerCase,
            priceBasis: row?.basis ?? "Historical (no current entry)",
            priceEffective: row?.effective ?? "",
          });
        }
      }
      return { ...s, draft: next };
    });
    return { added, repriced };
  }, []);

  const submitSampleRequest = useCallback<Ctx["submitSampleRequest"]>(
    (input) => {
      const duplicate = state.sampleRequests.find(
        (r) => r.idempotencyKey === input.idempotencyKey,
      );
      if (duplicate) return duplicate;
      const at = stamp();
      const request: SampleRequest = {
        ...input,
        reference: `SMP-${1048 + state.sampleRequests.length}`,
        submittedAt: at,
        status: "Received",
        events: [{ at, text: "Request received in the prototype queue (simulated)." }],
      };
      setState((s) =>
        s.sampleRequests.some((r) => r.idempotencyKey === input.idempotencyKey)
          ? s
          : { ...s, sampleRequests: [request, ...s.sampleRequests], samples: [] },
      );
      return request;
    },
    [state.sampleRequests],
  );

  const advanceSample = useCallback<Ctx["advanceSample"]>((reference, status, note) => {
    setState((s) => ({
      ...s,
      sampleRequests: s.sampleRequests.map((r) =>
        r.reference === reference
          ? { ...r, status, events: [...r.events, { at: stamp(), text: note }] }
          : r,
      ),
    }));
  }, []);

  const recordPayment = useCallback<Ctx["recordPayment"]>((invoiceId, amount, outcome) => {
    const attempt: PaymentAttempt = {
      id: `PAY-${String(Date.now()).slice(-6)}`,
      invoiceId,
      amount,
      at: stamp(),
      outcome,
    };
    setState((s) => {
      const current = s.payments[invoiceId] ?? { applied: 0, pending: 0 };
      const next =
        outcome === "Applied"
          ? { applied: current.applied + amount, pending: 0 }
          : outcome === "Received — ERP posting pending"
            ? { ...current, pending: amount }
            : current;
      return {
        ...s,
        payments: { ...s.payments, [invoiceId]: next },
        attempts: [attempt, ...s.attempts],
      };
    });
    return attempt;
  }, []);

  const postPending = useCallback((invoiceId: string) => {
    setState((s) => {
      const current = s.payments[invoiceId];
      if (!current || current.pending === 0) return s;
      return {
        ...s,
        payments: {
          ...s.payments,
          [invoiceId]: { applied: current.applied + current.pending, pending: 0 },
        },
        attempts: [
          {
            id: `PAY-${String(Date.now()).slice(-6)}`,
            invoiceId,
            amount: current.pending,
            at: stamp(),
            outcome: "Applied" as const,
          },
          ...s.attempts,
        ],
      };
    });
  }, []);

  const paymentFor = useCallback(
    (invoiceId: string) => state.payments[invoiceId] ?? { applied: 0, pending: 0 },
    [state.payments],
  );

  const toggleSimulation = useCallback<Ctx["toggleSimulation"]>((key) => {
    setState((s) => ({ ...s, [key]: !s[key] }));
  }, []);

  const resetDemo = useCallback(() => {
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
