import { Link } from "@tanstack/react-router";
import { Compass, FlaskConical, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useDemo } from "@/lib/demo-store";
import { useGuidedDemo } from "@/lib/guided-demo";

export function PrototypeBanner() {
  return (
    <div className="border-b border-border bg-steel-deep text-primary-foreground">
      <p className="label-caps mx-auto flex max-w-[1400px] items-center gap-2 px-4 py-2 text-[0.625rem] sm:text-[0.6875rem]">
        <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-accent" />
        Interactive prototype · Demo data · No live systems connected
      </p>
    </div>
  );
}

const NAV = [
  { to: "/catalog", label: "Catalog" },
  { to: "/samples", label: "Samples" },
  { to: "/integration", label: "Integration" },
] as const;

export function Wordmark() {
  return (
    <Link to="/" className="group flex items-baseline gap-2" aria-label="Taral Direct home">
      <span className="font-display text-xl font-bold tracking-tight">TARAL</span>
      <span className="label-caps border-l border-border pl-2 text-accent">Direct</span>
    </Link>
  );
}

export function SiteHeader() {
  const { samples } = useDemo();
  const { start, running } = useGuidedDemo();
  const count = samples.reduce((n, l) => n + l.qty, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-[2px]">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3">
        <Wordmark />
        <nav aria-label="Main" className="ml-6 hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="label-caps text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "label-caps text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="rail"
            size="sm"
            onClick={start}
            aria-pressed={running}
            className="hidden sm:inline-flex"
          >
            <Compass className="size-3.5" /> Guided demo
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/samples">
              <FlaskConical className="size-4" />
              <span className="hidden xs:inline">Samples</span>
              <span className="tabular">({count})</span>
            </Link>
          </Button>
          <Button size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/portal">Distributor sign in</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="label-caps">Navigate</SheetTitle>
              <nav aria-label="Mobile" className="mt-6 flex flex-col gap-1">
                {[...NAV, { to: "/portal", label: "Distributor portal" }].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="border-b border-border py-3 font-display text-base"
                  >
                    {item.label}
                  </Link>
                ))}
                <Button variant="rail" size="sm" onClick={start} className="mt-4">
                  <Compass className="size-3.5" /> Guided demo
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="measure mt-4 text-sm text-muted-foreground">
            Taral Plastics manufactures plastic packaging — jars, closures, discs, and add-ons —
            with over 60 years of production experience.
          </p>
          <p className="label-caps mt-5 text-accent">Concept prototype — not a production system</p>
        </div>
        <div>
          <h2 className="label-caps text-muted-foreground">Contact</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a className="hover:underline" href="mailto:sales@taralplastics.com">
                sales@taralplastics.com
              </a>
            </li>
            <li>
              <a className="hover:underline" href="tel:+15109726300">
                (510) 972-6300
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="label-caps text-muted-foreground">Prototype</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="hover:underline" to="/catalog">
                Product catalog
              </Link>
            </li>
            <li>
              <Link className="hover:underline" to="/samples">
                Sample request
              </Link>
            </li>
            <li>
              <Link className="hover:underline" to="/portal">
                Distributor portal
              </Link>
            </li>
            <li>
              <Link className="hover:underline" to="/integration">
                Integration blueprint
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="spec-note mx-auto max-w-[1400px] px-4 py-4">
          Demonstration environment · No Acumatica, database, or payment systems are connected ·
          Figures labeled “Demo data” or “Illustrative” are not real business results.
        </p>
      </div>
    </footer>
  );
}
