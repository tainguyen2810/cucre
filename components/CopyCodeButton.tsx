"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/** Sao chép mã giảm giá rồi mở trang sàn ở tab mới qua /go. */
export function CopyCodeButton({ code, href }: { code: string; href: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Trình duyệt chặn clipboard: khách vẫn thấy mã để tự chép.
    }
    setCopied(true);
    window.open(href, "_blank", "noopener");
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <Button onClick={handleClick} aria-live="polite" className="shrink-0">
      {copied ? "Đã chép" : "Sao chép"}
    </Button>
  );
}
