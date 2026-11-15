import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "discount" | "platform" | "flash" | "verified" | "expired" | "info";

const tones: Record<Tone, string> = {
  discount: "bg-brand text-white font-extrabold text-[13px] px-[9px] py-1 rounded-sm",
  platform: "bg-surface border border-line text-ink font-semibold text-xs px-[9px] py-1 rounded-sm",
  flash: "bg-flash text-ink font-bold text-xs px-2.5 py-[5px] rounded-full uppercase",
  verified: "bg-ok-bg text-ok font-bold text-xs px-2 py-[3px] rounded-sm",
  expired: "bg-ink/80 text-white font-semibold text-xs px-2 py-1 rounded-sm",
  info: "bg-info-bg text-info font-semibold text-xs px-2 py-[3px] rounded-sm",
};

export function Badge({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 leading-tight whitespace-nowrap", tones[tone], className)}>
      {tone === "verified" && <Check aria-hidden className="size-3.5" strokeWidth={3} />}
      {children}
    </span>
  );
}
