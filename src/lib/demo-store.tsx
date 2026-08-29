import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SEED_ORDERS, type DemoOrder } from "@/data/portal";

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
}

interface DemoState {
  samples: SampleLine[];
  draft: OrderDraftLine[];
  accountId: string | null;
  localOrders: DemoOrder[];
  paidInvoices: string[];
}

const EMPTY: DemoState = {
  samples: [],
  draft: [],
  accountId: null,
  localOrders: [],
  paidInvoices: [],
};

const KEY = "taral-direct-demo-v1";

interface Ctx extends DemoState {
  hydrated: boolean;
  addSample: (line: Omit<SampleLine, "qty" | "note"> & { qty?: number }) => void;
  updateSample: (productId: string, patch: Partial<SampleLine>) => void;
  removeSample: (productId: string) => void;
  clearSamples: () => void;
  addDraftLine: (line: Omit<OrderDraftLine, "cases"> & { cases?: number }) => void;
  updateDraft: (productId: string, cases: number) => void;
  removeDraft: (productId: string) => void;
  clearDraft: () => void;
  enterDemo: (accountId: string) => void;
  exitDemo: () => void;
  placeDraftOrder: (po: string) => DemoOrder | null;
  reorder: (order: DemoOrder) => void;
  markInvoicePaid: (invoiceId: string) => void;
  orders: DemoOrder[];
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
            l.productId === line.productId ? { ...l, qty: l.qty + (line.qty ?? 1) } : l,
          ),
        };
      }
      return {
        ...s,
        samples: [...s.samples, { ...line, qty: line.qty ?? 1, note: "" }],
      };
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
      return { ...s, draft: [...s.draft, { ...line, cases: line.cases ?? 1 }] };
    });
  }, []);

  const updateDraft = useCallback((productId: string, cases: number) => {
    setState((s) => ({
      ...s,
      draft: s.draft.map((l) =>
        l.productId === productId ? { ...l, cases: Math.max(1, cases) } : l,
      ),
    }));
  }, []);

  const removeDraft = useCallback((productId: string) => {
    setState((s) => ({ ...s, draft: s.draft.filter((l) => l.productId !== productId) }));
  }, []);

  const clearDraft = useCallback(() => setState((s) => ({ ...s, draft: [] })), []);

  const enterDemo = useCallback((accountId: string) => {
    setState((s) => ({ ...s, accountId }));
  }, []);

  const exitDemo = useCallback(() => {
    setState((s) => ({ ...s, accountId: null, draft: [] }));
  }, []);

  const placeDraftOrder = useCallback<Ctx["placeDraftOrder"]>(
    (po) => {
      if (!state.accountId || state.draft.length === 0) return null;
      const order: DemoOrder = {
        id: `SO-D${String(Date.now()).slice(-5)}`,
        accountId: state.accountId,
        po: po || "ML-PO-DEMO",
        date: new Date().toISOString().slice(0, 10),
        status: "Submitted",
        shipment: "Not yet released (demo)",
        tracking: null,
        lines: state.draft.map((l) => ({
          productId: l.productId,
          code: l.code,
          description: l.name,
          cases: l.cases,
          eachPerCase: l.eachPerCase,
          unitPrice: l.unitPrice,
        })),
      };
      setState((s) => ({ ...s, localOrders: [order, ...s.localOrders], draft: [] }));
      return order;
    },
    [state.accountId, state.draft],
  );

  const reorder = useCallback((order: DemoOrder) => {
    setState((s) => {
      const next = [...s.draft];
      for (const line of order.lines) {
        const idx = next.findIndex((l) => l.productId === line.productId);
        if (idx >= 0) next[idx] = { ...next[idx], cases: next[idx].cases + line.cases };
        else
          next.push({
            productId: line.productId,
            code: line.code,
            name: line.description,
            cases: line.cases,
            unitPrice: line.unitPrice,
            eachPerCase: line.eachPerCase,
          });
      }
      return { ...s, draft: next };
    });
  }, []);

  const markInvoicePaid = useCallback((invoiceId: string) => {
    setState((s) =>
      s.paidInvoices.includes(invoiceId)
        ? s
        : { ...s, paidInvoices: [...s.paidInvoices, invoiceId] },
    );
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
    enterDemo,
    exitDemo,
    placeDraftOrder,
    reorder,
    markInvoicePaid,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
  return ctx;
}
