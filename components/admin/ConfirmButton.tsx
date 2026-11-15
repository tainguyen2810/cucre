"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/** Nút xóa 2 bước: bấm lần đầu hiện "Chắc chắn xóa?", bấm lần hai mới gửi form. */
export function ConfirmButton({ label = "Xóa", confirmLabel = "Chắc chắn xóa?" }: { label?: string; confirmLabel?: string }) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <Button type="button" variant="light" size="sm" onClick={() => setArmed(true)}>
        {label}
      </Button>
    );
  }
  return (
    <span className="inline-flex gap-1">
      <Button type="submit" size="sm">
        {confirmLabel}
      </Button>
      <Button type="button" variant="light" size="sm" onClick={() => setArmed(false)}>
        Hủy
      </Button>
    </span>
  );
}
