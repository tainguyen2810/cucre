import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const chipBase =
  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors";
const chipOff = "border-line-strong bg-surface text-ink hover:border-ink";
const chipOn = "border-ink bg-ink text-white";

export function chipClass(active: boolean, className?: string) {
  return cn(chipBase, active ? chipOn : chipOff, className);
}

/** Chip dạng link – dùng cho bộ lọc qua URL */
export function ChipLink({ href, active = false, children }: { href: string; active?: boolean; children: ReactNode }) {
  return (
    <Link href={href} className={chipClass(active)} aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  );
}
