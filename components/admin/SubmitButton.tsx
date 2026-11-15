"use client";

import { Button, type ButtonVariant } from "@/components/ui/Button";

export function SubmitButton({
  children,
  pending = false,
  pendingText = "Đang lưu…",
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  pending?: boolean;
  pendingText?: string;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <Button type="submit" variant={variant} disabled={pending} className={className}>
      {pending ? pendingText : children}
    </Button>
  );
}
