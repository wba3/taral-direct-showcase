import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LogOut, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoTag } from "@/components/site/DemoTag";
import { useDemo } from "@/lib/demo-store";
import { DEMO_TODAY_LABEL, getRole, type DemoAccount } from "@/data/portal";

const ALL_NAV = [
  { to: "/portal", label: "Overview", exact: true, roles: ["buyer", "finance"] },
  { to: "/portal/catalog", label: "Order", roles: ["buyer"] },
  { to: "/portal/orders", label: "Orders", roles: ["buyer", "finance"] },
  { to: "/portal/invoices", label: "Invoices", roles: ["buyer", "finance"] },
  { to: "/portal/price-book", label: "Price book", roles: ["buyer", "finance"] },
  { to: "/portal/samples", label: "Samples", roles: ["buyer", "finance", "ops"] },
  { to: "/portal/operations", label: "Operations", roles: ["ops"] },
  { to: "/portal/account", label: "Account", roles: ["buyer", "finance"] },
] as const;

export function PortalShell({
  account,
  title,
  intro,
  rail,
  children,
}: {
  /** Null for Taral staff screens, which are not scoped to one customer account. */
  account: DemoAccount | null;
  title: string;
  intro?: ReactNode;
  /** Quiet action rail — secondary tools for the current screen. */
  rail?: ReactNode;
  children: ReactNode;
}) {
  const { exitDemo, draft, role } = useDemo();
  const draftCases = draft.reduce((n, l) => n + l.cases, 0);
  const roleDef = getRole(role);
  const nav = ALL_NAV.filter((item) => (role ? (item.roles as readonly string[]).includes(role) : false));

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="label-caps text-muted-foreground">
            {account ? "Taral Direct · account service" : "Taral Plastics · operations"}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="spec-note mt-1">
            {account
              ? `${account.name} · Account ${account.id} · Terms ${account.terms}`
              : "Internal customer service view"}
            {roleDef ? ` · ${roleDef.person}, ${roleDef.label}` : ""} · As of {DEMO_TODAY_LABEL}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DemoTag>Demo data</DemoTag>
          <DemoTag tone="neutral">Demo role</DemoTag>
          <Button variant="rail" size="sm" asChild>
            <Link to="/demo-control">
              <SlidersHorizontal className="size-3.5" /> Switch role
            </Link>
          </Button>
          <Button variant="rail" size="sm" onClick={exitDemo}>
            <LogOut className="size-3.5" /> Sign out
          </Button>
        </div>
      </div>

      <nav aria-label="Account" className="-mx-4 overflow-x-auto px-4">
        <ul className="flex min-w-max gap-1 border-b border-border">
          {nav.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                activeOptions={{ exact: "exact" in item ? item.exact : false }}
                className="label-caps -mb-px inline-block border-b-2 border-transparent px-3 py-3 text-muted-foreground hover:text-foreground"
                activeProps={{ className: "label-caps border-accent text-foreground" }}
              >
                {item.label}
                {item.label === "Order" && draftCases > 0 ? ` (${draftCases})` : ""}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {intro && <div className="pt-6">{intro}</div>}

      <div className={rail ? "grid gap-8 pt-6 lg:grid-cols-[1fr_260px]" : "pt-6"}>
        <div className="min-w-0">{children}</div>
        {rail && (
          <aside aria-label="Actions" className="lg:border-l lg:border-border lg:pl-6">
            {rail}
          </aside>
        )}
      </div>
    </div>
  );
}
