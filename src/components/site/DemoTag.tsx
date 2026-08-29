import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "demo" | "illustrative" | "neutral" | "accent";

const TONES: Record<Tone, string> = {
  demo: "border-primary/40 text-primary",
  illustrative: "border-accent/50 text-accent",
  neutral: "border-border text-muted-foreground",
  accent: "border-accent bg-accent text-accent-foreground",
};

/** Provenance marker. Every operational number in the prototype wears one. */
export function DemoTag({
  tone = "demo",
  children,
  className,
}: {
  tone?: Tone;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "label-caps inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[0.625rem]",
        TONES[tone],
        className,
      )}
    >
      {children ?? (tone === "illustrative" ? "Illustrative" : "Demo data")}
    </span>
  );
}
