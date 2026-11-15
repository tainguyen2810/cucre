"use client";

import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { REGIONS, REGION_COOKIE, type RegionValue } from "@/lib/site";
import { cn } from "@/lib/cn";

/** Chọn khu vực, lưu vào cookie 1 năm rồi tải lại dữ liệu trang. */
export function RegionSelect({ value, compact = false, id }: { value: RegionValue; compact?: boolean; id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className={cn("relative flex items-center", pending && "opacity-60")}>
      <MapPin className="pointer-events-none absolute left-2.5 size-4 text-brand" aria-hidden />
      <label htmlFor={id} className="sr-only">
        Khu vực
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => {
          document.cookie = `${REGION_COOKIE}=${e.target.value}; path=/; max-age=31536000; samesite=lax`;
          startTransition(() => router.refresh());
        }}
        className={cn(
          "h-11 appearance-none rounded-lg border border-line-strong bg-surface pr-3 pl-8 text-sm font-semibold hover:border-ink",
          compact ? "max-w-[96px]" : "min-w-[130px]",
        )}
      >
        {REGIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {compact ? r.short : r.label}
          </option>
        ))}
      </select>
    </div>
  );
}
