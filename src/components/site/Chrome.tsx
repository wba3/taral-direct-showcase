import { Link } from "@tanstack/react-router";
import { FlaskConical, Menu, SlidersHorizontal, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useDemo } from "@/lib/demo-store";
import { useSiteImages } from "@/lib/site-images";
import { getRole } from "@/data/portal";

const LOGO_FALLBACK = "https://taralplastics.com/images/logo.png";

export function PrototypeBanner() {
  return (
    <div className="border-b border-border bg-steel-deep text-primary-foreground">
      <p className="label-caps mx-auto flex max-w-[1400px] items-center gap-2 px-4 py-2 text-[0.625rem] sm:text-[0.6875rem]">
        <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-accent" />
        Interactive prototype · Demo transactions · Acumatica and payments not connected
      </p>
    </div>
  );
}

const NAV = [
  { to: "/catalog", label: "Products" },
  { to: "/samples", label: "Samples" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Wordmark() {
  const { logo } = useSiteImages();
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Taral Plastics home">
      <img
        src={logo ?? LOGO_FALLBACK}
        alt="Taral Plastics"
        width={132}
        height={32}
        className="h-7 w-auto sm:h-8"
      />
      <span className="label-caps hidden border-l border-border pl-3 text-accent sm:inline">
        Direct
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const { samples, role } = useDemo();
  const count = samples.reduce((n, l) => n + l.qty, 0);
  const activeRole = getRole(role);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-[2px]">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3">
        <Wordmark />
        <nav aria-label="Main" className="ml-6 hidden items-center gap-6 lg:flex">
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
        <div className="ml-auto flex min-w-0 items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/samples" aria-label={`Sample basket, ${count} items`}>
              <FlaskConical className="size-4" />
              <span className="hidden sm:inline">Sample basket</span>
              <span className="tabular">({count})</span>
            </Link>
          </Button>
          <Button size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/portal">
              <UserRound className="size-4" />
              <span className="truncate">{activeRole ? activeRole.label : "Account access"}</span>
            </Link>
          </Button>
          <Button variant="rail" size="sm" asChild className="hidden xl:inline-flex">
            <Link to="/demo-control">
              <SlidersHorizontal className="size-3.5" /> Demo controls
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 overflow-y-auto">
              <SheetTitle className="label-caps">Navigate</SheetTitle>
              <nav aria-label="Mobile" className="mt-6 flex flex-col">
                {[
                  ...NAV,
                  { to: "/faq", label: "FAQ" },
                  { to: "/portal", label: "Account access" },
                  { to: "/demo-control", label: "Demo controls" },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="border-b border-border py-3 font-display text-base"
                  >
                    {item.label}
                  </Link>
                ))}
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
            Taral Plastics manufactures plastic packaging — jars, closures, discs, and add-ons — with
            more than 60 years of production experience. Direct is the online account service for
            samples, pricing, orders, and invoices.
          </p>
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
            <li>
              <Link className="hover:underline" to="/contact">
                Contact form
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="label-caps text-muted-foreground">Customer service</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="hover:underline" to="/samples">
                Request samples
              </Link>
            </li>
            <li>
              <Link className="hover:underline" to="/portal">
                Account access
              </Link>
            </li>
            <li>
              <Link className="hover:underline" to="/faq">
                FAQ
              </Link>
            </li>
            <li>
              <a
                className="hover:underline"
                href="https://taralplastics.com/"
                rel="noreferrer"
                target="_blank"
              >
                Pricing and terms on taralplastics.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="spec-note mx-auto max-w-[1400px] px-4 py-4">
          Interactive prototype · Demo transactions · Acumatica and payments not connected. Prices,
          balances, stock, orders, and payments shown here are synthetic examples.
        </p>
      </div>
    </footer>
  );
}
