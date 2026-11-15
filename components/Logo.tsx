import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("text-[26px] leading-none font-extrabold tracking-tight whitespace-nowrap", className)} aria-label="cucre.vn – Trang chủ">
      <span className="text-brand">cucre</span>.vn
    </Link>
  );
}
