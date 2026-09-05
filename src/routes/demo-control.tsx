import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Compass, RotateCcw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DemoTag } from "@/components/site/DemoTag";
import { useDemo } from "@/lib/demo-store";
import { useGuidedDemo } from "@/lib/guided-demo";
import { DEMO_ROLES, DEMO_TODAY_LABEL } from "@/data/portal";

export const Route = createFileRoute("/demo-control")({
  head: () => ({
    meta: [
      { title: "Demo controls — Taral Direct prototype" },
      {
        name: "description",
        content:
          "Presenter controls for the Taral Direct prototype: pick a role, run the guided walkthrough, simulate a price update or stale availability, and reset local demo state.",
      },
      { property: "og:title", content: "Demo controls — Taral Direct prototype" },
      {
        property: "og:description",
        content: "Presenter controls for the Taral Direct owner demo.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DemoControl,
});

const READY = [
  ["Public catalog, search, filters, and specifications", "Working in the prototype"],
  ["Sample basket, validated request, and staff processing", "Working, stored in this browser"],
  ["Role-scoped pricing, orders, invoices", "Working on synthetic data"],
  ["Invoice payment, decline, and posting-pending handling", "Simulated end to end"],
  ["Price book CSV and printable invoice", "Generated locally in the browser"],
  ["Real product and category photography", "Imported from taralplastics.com"],
];

const SIMULATED = [
  ["Prices, availability, orders, invoices, balances", "Synthetic examples, not Taral figures"],
  ["Payments", "No processor connected; no card or bank details are ever collected"],
  ["Sample requests and contact messages", "Never transmitted, emailed, or written to any system"],
  ["Sign-in and roles", "Selection only — this is not authentication or authorization"],
];

const NEEDS_VALIDATION = [
  ["Acumatica sandbox", "Confirm entity mapping, price resolution, and order write-back"],
  ["Real authentication", "Per-user sign-in with server-side authorization per account"],
  ["Payments partner", "Confirm which route issues the invoice and which collects payment"],
  ["Inventory truth", "Agree how available-to-sell is read and how stale reads are surfaced"],
];

function DemoControl() {
  const {
    role,
    setRole,
    resetDemo,
    simulatePriceUpdate,
    simulateStaleInventory,
    toggleSimulation,
    sampleRequests,
    attempts,
  } = useDemo();
  const { start } = useGuidedDemo();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12">
      <div className="max-w-3xl">
        <p className="label-caps flex items-center gap-2 text-accent">
          <ShieldAlert className="size-4" aria-hidden="true" /> Presenter only
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">Demo controls</h1>
        <p className="mt-4 text-muted-foreground">
          These controls exist for the demonstration and are deliberately kept away from customer
          actions. The demo business date is fixed at {DEMO_TODAY_LABEL}, so effective dates and
          overdue invoices stay coherent from one showing to the next.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="roles-heading">
            <h2 id="roles-heading" className="font-display text-2xl font-bold tracking-tight">
              Choose a role
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Switching role rescopes the session and clears any order draft, so one account's work
              never appears under another.
            </p>
            <ul className="mt-5 grid gap-px bg-border sm:grid-cols-3">
              {DEMO_ROLES.map((r) => (
                <li key={r.id} className="bg-card p-5">
                  <p className="label-caps text-muted-foreground">{r.label}</p>
                  <p className="mt-1 font-display text-base font-semibold">{r.person}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{r.summary}</p>
                  <Button
                    className="mt-4 w-full"
                    variant={role === r.id ? "accent" : "outline"}
                    aria-pressed={role === r.id}
                    onClick={() => {
                      setRole(r.id);
                      toast.success(`Now viewing as ${r.label}`, {
                        description: "Demo role — selection only, not a sign-in.",
                      });
                      navigate({ to: r.accountId ? "/portal" : "/portal/operations" });
                    }}
                  >
                    {role === r.id ? "Active" : "View as this role"}
                  </Button>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              <DemoTag tone="illustrative">Demo role · not authentication</DemoTag>
            </p>
          </section>

          <section aria-labelledby="sim-heading">
            <h2 id="sim-heading" className="font-display text-2xl font-bold tracking-tight">
              Simulations
            </h2>
            <ul className="mt-5 divide-y divide-border border-y border-border">
              <li className="flex flex-wrap items-center gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <Label htmlFor="sim-price" className="font-display text-base font-semibold">
                    Simulate price update
                  </Label>
                  <p className="measure mt-1 text-sm text-muted-foreground">
                    Brings each announced future price forward as if its effective date had arrived.
                    With the toggle off, future prices are shown but never applied.
                  </p>
                </div>
                <Switch
                  id="sim-price"
                  checked={simulatePriceUpdate}
                  onCheckedChange={() => toggleSimulation("simulatePriceUpdate")}
                />
              </li>
              <li className="flex flex-wrap items-center gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <Label htmlFor="sim-stock" className="font-display text-base font-semibold">
                    Simulate stale availability
                  </Label>
                  <p className="measure mt-1 text-sm text-muted-foreground">
                    Marks availability as a stale snapshot, so order review warns instead of
                    pretending the number is current.
                  </p>
                </div>
                <Switch
                  id="sim-stock"
                  checked={simulateStaleInventory}
                  onCheckedChange={() => toggleSimulation("simulateStaleInventory")}
                />
              </li>
            </ul>
          </section>

          <section aria-labelledby="ready-heading">
            <h2 id="ready-heading" className="font-display text-2xl font-bold tracking-tight">
              Owner readiness
            </h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-3">
              {(
                [
                  ["What works today", READY],
                  ["What is simulated", SIMULATED],
                  ["What needs validation", NEEDS_VALIDATION],
                ] as const
              ).map(([heading, rows]) => (
                <div key={heading}>
                  <h3 className="label-caps text-muted-foreground">{heading}</h3>
                  <ul className="mt-3 space-y-3">
                    {rows.map(([label, note]) => (
                      <li key={label} className="border-l-2 border-border pl-3">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="spec-note">{note}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="panel p-5">
            <h2 className="font-display text-lg font-semibold">Guided walkthrough</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Seven stops, from finding a jar to clearing a posting exception. Next and back move
              through the story.
            </p>
            <Button className="mt-4 w-full" onClick={start}>
              <Compass className="size-4" /> Start the walkthrough
            </Button>
          </div>

          <div className="panel p-5">
            <h2 className="font-display text-lg font-semibold">Session state</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sample requests</dt>
                <dd className="tabular">{sampleRequests.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Payment attempts</dt>
                <dd className="tabular">{attempts.length}</dd>
              </div>
            </dl>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => setConfirmReset(true)}
            >
              <RotateCcw className="size-4" /> Reset demo
            </Button>
            <p className="spec-note mt-2">
              Clears only demo activity stored in this browser. Product photography and catalog
              content are untouched.
            </p>
          </div>

          <div className="panel p-5">
            <h2 className="font-display text-lg font-semibold">Owner references</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/integration" className="text-primary hover:underline">
                  Integration approach and open questions
                </Link>
              </li>
              <li>
                <Link to="/admin/assets" className="text-primary hover:underline">
                  Imported image library
                </Link>
              </li>
              <li>
                <Link to="/portal/operations" className="text-primary hover:underline">
                  Taral operations queue
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent className="max-w-md rounded-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Reset the demo?</DialogTitle>
            <DialogDescription>
              This clears the sample basket, order drafts, submitted sample requests, simulated
              payments, and the selected role from this browser. Nothing outside this browser
              changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReset(false)}>
              Keep the current state
            </Button>
            <Button
              variant="accent"
              onClick={() => {
                resetDemo();
                setConfirmReset(false);
                toast.success("Demo reset", { description: "Local demo activity cleared." });
              }}
            >
              Reset demo state
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
