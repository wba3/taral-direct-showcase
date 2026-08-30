import { createFileRoute } from "@tanstack/react-router";

/**
 * Serves a harvested public-site image from private storage. The bucket is
 * private, so this route reads it server-side and streams the bytes back with
 * long-lived cache headers. Read-only, no user data.
 */
export const Route = createFileRoute("/api/public/site-asset/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";
        if (!path || path.includes("..") || path.length > 300) {
          return new Response("Bad request", { status: 400 });
        }

        const { downloadStoredAsset } = await import("@/lib/harvest.server");
        const file = await downloadStoredAsset(path);
        if (!file) return new Response("Not found", { status: 404 });

        return new Response(file.body, {
          headers: {
            "content-type": file.contentType,
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
