import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Compass, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import type { DemoRoleId } from "@/data/portal";

interface Step {
  id: string;
  label: string;
  to: string;
  params?: Record<string, string>;
  target: string;
  note: string;
  role?: DemoRoleId;
}

export const DEMO_STEPS: Step[] = [
  {
    id: "catalog",
    label: "Find the jar",
    to: "/catalog",
    target: "catalog",
    note: "A buyer starts by specification: fill volume, neck finish, wall style, or item code.",
  },
  {
    id: "product",
    label: "Check the specification",
    to: "/product/$id",
    params: { id: "two-53-tw-blk" },
    target: "product",
    note: "Dimensions, case count, and matching closures by full thread finish — not diameter alone.",
  },
  {
    id: "samples",
    label: "Request samples",
    to: "/samples",
    target: "sample-cart",
    note: "The public conversion: a small evaluation quantity, contact details, and ship method.",
  },
  {
    id: "pricing",
    label: "Distributor pricing",
    to: "/portal/price-book",
    target: "price-book",
    note: "Contract price, quantity breaks, and an announced change with its effective date.",
    role: "buyer",
  },
  {
    id: "order",
    label: "Place an order",
    to: "/portal/catalog",
    target: "portal-catalog",
    note: "Whole cases at the account's current price, reviewed against availability before submit.",
    role: "buyer",
  },
  {
    id: "invoices",
    label: "Finance and payment",
    to: "/portal/invoices",
    target: "invoices",
    note: "Outstanding balance, terms, discount deadline, and a simulated payment with no card details.",
    role: "finance",
  },
  {
    id: "operations",
    label: "Taral clears an exception",
    to: "/portal/operations",
    target: "operations",
    note: "Staff process the sample request and finish a payment that was received but not yet posted.",
    role: "ops",
  },
];

interface Ctx {
  running: boolean;
  index: number;
  start: () => void;
  stop: () => void;
  goTo: (i: number) => void;
}

const GuidedContext = createContext<Ctx | null>(null);

export function GuidedDemoProvider({ children }: { children: ReactNode }) {
  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role, setRole } = useDemo();

  const step = DEMO_STEPS[index] ?? DEMO_STEPS[0]!;

  const goTo = useCallback(
    (i: number) => {
      const next = DEMO_STEPS[Math.max(0, Math.min(DEMO_STEPS.length - 1, i))]!;
      setIndex(DEMO_STEPS.indexOf(next));
      if (next.role && next.role !== role) setRole(next.role);
      navigate({ to: next.to, params: next.params ?? {} } as never);
    },
    [role, setRole, navigate],
  );


  const start = useCallback(() => {
    setRunning(true);
    goTo(0);
  }, [goTo]);

  const stop = useCallback(() => {
    setRunning(false);
    document
      .querySelectorAll("[data-demo-active='true']")
      .forEach((el) => el.setAttribute("data-demo-active", "false"));
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => {
      document
        .querySelectorAll("[data-demo-target]")
        .forEach((el) => el.setAttribute("data-demo-active", "false"));
      const el = document.querySelector(`[data-demo-target='${step.target}']`);
      if (el) {
        el.setAttribute("data-demo-active", "true");
        el.scrollIntoView({ block: "start", behavior: "auto" });
      }
    }, 220);
    return () => window.clearTimeout(id);
  }, [running, step, pathname]);

  return (
    <GuidedContext.Provider value={{ running, index, start, stop, goTo }}>
      {children}
      {running && (
        <div
          role="region"
          aria-label="Guided demo"
          className="fixed inset-x-3 bottom-3 z-50 panel shadow-lg sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="label-caps flex items-center gap-2 text-primary">
              <Compass className="size-3.5" aria-hidden="true" /> Guided demo
            </span>
            <button
              onClick={stop}
              className="text-muted-foreground hover:text-foreground"
              aria-label="End guided demo"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="px-3 py-3">
            <p className="spec-note">
              Step {index + 1} of {DEMO_STEPS.length}
            </p>
            <h2 className="mt-1 text-base font-semibold">{step.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{step.note}</p>
            <ol className="mt-3 flex flex-wrap gap-1">
              {DEMO_STEPS.map((s, i) => (
                <li key={s.id}>
                  <button
                    onClick={() => goTo(i)}
                    aria-current={i === index ? "step" : undefined}
                    className={`spec-note rounded-sm border px-2 py-1 ${
                      i === index
                        ? "border-accent text-accent"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ol>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goTo(index - 1)}
                disabled={index === 0}
              >
                <ChevronLeft className="size-4" /> Back
              </Button>
              {index === DEMO_STEPS.length - 1 ? (
                <Button size="sm" onClick={stop}>
                  Finish
                </Button>
              ) : (
                <Button size="sm" onClick={() => goTo(index + 1)}>
                  Next <ChevronRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </GuidedContext.Provider>
  );
}

export function useGuidedDemo() {
  const ctx = useContext(GuidedContext);
  if (!ctx) throw new Error("useGuidedDemo must be used inside GuidedDemoProvider");
  return ctx;
}
