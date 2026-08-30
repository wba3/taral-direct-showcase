import { createServerFn } from "@tanstack/react-start";

import type { HarvestSummary } from "./harvest.server";

/**
 * Triggers the public-site harvest. Idempotent: images already stored are
 * skipped. A short cooldown keeps repeated clicks from re-crawling the site.
 */
export const runHarvest = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: boolean; message: string; summary?: HarvestSummary }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: recent } = await supabaseAdmin
      .from("site_assets")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1);

    const last = recent?.[0]?.updated_at ? new Date(recent[0].updated_at).getTime() : 0;
    if (last && Date.now() - last < 60_000) {
      return { ok: false, message: "A harvest just ran. Try again in a minute." };
    }

    const { runSiteHarvest } = await import("./harvest.server");
    try {
      const summary = await runSiteHarvest();
      return {
        ok: summary.errors.length === 0,
        message:
          summary.errors.length === 0
            ? `Stored ${summary.imagesStored} new files across ${summary.pages} pages.`
            : `Completed with ${summary.errors.length} problem(s).`,
        summary,
      };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Harvest failed unexpectedly.",
      };
    }
  },
);
