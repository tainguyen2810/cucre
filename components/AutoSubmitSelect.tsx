"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** <select> trong form GET: đổi lựa chọn là gửi form ngay (không JS thì bấm nút Lọc). */
export function AutoSubmitSelect({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      {...props}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className={cn("h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm font-semibold hover:border-ink", className)}
    />
  );
}
