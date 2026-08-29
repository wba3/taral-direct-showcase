import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoTag } from "@/components/site/DemoTag";
import { useDemo } from "@/lib/demo-store";
import type { DemoAccount } from "@/data/portal";

const PORTAL_NAV = [
  { to: "/portal", label: "Overview", exact: true },
  { to: "/portal/catalog", label: "Catalog" },
  { to: "/portal/orders", label: "Orders" },
  { to: "/portal/invoices", label: "Invoices" },
  { to: "/portal/price-book", label: "Price Book" },
  { to: "/portal/account", label: "Account" },
] as const;

export function PortalShell({
  account,
  title,
  intro,
  rail,
  children,
}: {
  account: DemoAccount;
  title: string;
  intro?: ReactNode;
  /** Quiet action rail — secondary tools for the current screen. */
  rail?: ReactNode;
  children: ReactNode;
}) {
  const { exitDemo, draft } = useDemo();
  const draftCases = draft.reduce((n, l) => n + l.cases, 0);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="label-caps text-muted-foreground">Distributor portal</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="spec-note mt-1">
            {account.name} · Account {account.id} · Terms {account.terms}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DemoTag>Demo data</DemoTag>
          <Button variant="rail" size="sm" onClick={exitDemo}>
            <LogOut className="size-3.5" /> Exit demo
          </Button>
        </div>
      </div>

      <nav aria-label="Portal" className="-mx-4 overflow-x-auto px-4">
        <ul className="flex min-w-max gap-1 border-b border-border">
          {PORTAL_NAV.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                activeOptions={{ exact: item.exact ?? false }}
                className="label-caps -mb-px inline-block border-b-2 border-transparent px-3 py-3 text-muted-foreground hover:text-foreground"
                activeProps={{ className: "label-caps border-accent text-foreground" }}
              >
                {item.label}
                {item.label === "Catalog" && draftCases > 0 ? ` (${draftCases})` : ""}
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
