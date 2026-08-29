import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoTag } from "@/components/site/DemoTag";

export const Route = createFileRoute("/integration")({
  head: () => ({
    meta: [
      { title: "Integration blueprint — how Taral Direct would connect | Taral Direct" },
      {
        name: "description",
        content:
          "Plain-language plan for connecting a modern Taral Plastics web experience to Acumatica as the system of record, plus payments and a phased rollout.",
      },
      { property: "og:title", content: "Integration blueprint — Taral Direct" },
      {
        property: "og:description",
        content:
          "Acumatica stays the system of record. This explains the flow, the statuses, and the phased path to production.",
      },
    ],
  }),
  component: Blueprint;
});

function Blueprint() {
  return null;
}
