import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { DemoProvider } from "@/lib/demo-store";
import { GuidedDemoProvider } from "@/lib/guided-demo";
import { PrototypeBanner, SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { SiteImageProvider } from "@/lib/site-images";
import { PRODUCTS } from "@/data/products";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md">
        <p className="label-caps text-accent">404</p>
        <h1 className="mt-2 font-display text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This prototype route doesn't exist. Try the catalog or the distributor portal.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/catalog"
            className="label-caps inline-flex items-center rounded-sm bg-primary px-4 py-2.5 text-primary-foreground"
          >
            Browse catalog
          </Link>
          <Link
            to="/"
            className="label-caps inline-flex items-center rounded-sm border border-input px-4 py-2.5"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md">
        <h1 className="font-display text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. You can retry or head back to the home page.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="label-caps inline-flex items-center rounded-sm bg-primary px-4 py-2.5 text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="label-caps inline-flex items-center rounded-sm border border-input px-4 py-2.5"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Taral Direct — Packaging catalog & distributor portal prototype" },
      {
        name: "description",
        content:
          "Concept prototype for Taral Plastics: jar and closure catalog, sample requests, and a distributor self-service portal. Demo data only.",
      },
      { name: "author", content: "Taral Plastics" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Source+Sans+3:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <DemoProvider>
        <SiteImageProvider products={PRODUCTS}>
        <GuidedDemoProvider>
          <a
            href="#main"
            className="label-caps sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <PrototypeBanner />
          <SiteHeader />
          <main id="main">
            {/* Required: nested routes render here. */}
            <Outlet />
          </main>
          <SiteFooter />
          <Toaster position="bottom-left" />
        </GuidedDemoProvider>
        </SiteImageProvider>
      </DemoProvider>
    </QueryClientProvider>
  );
}
