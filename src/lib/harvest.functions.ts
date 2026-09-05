import { createServerFn } from "@tanstack/react-start";

import type { HarvestSummary } from "./harvest.server";

/**
 * The one-time image import has already run and its results are stored.
 *
 * This operation used privileged database and storage access and called a paid
 * crawler, but had no real caller authorization — only a cooldown. It is now
 * disabled server-side and fails closed. Re-enabling it requires genuine staff
 * authentication checked on the server; a client flag or demo role must never
 * be treated as a privilege.
 */
export const runHarvest = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: boolean; message: string; summary?: HarvestSummary }> => ({
    ok: false,
    message:
      "Image import is disabled. It requires authenticated Taral staff access, which this prototype does not have.",
  }),
);
