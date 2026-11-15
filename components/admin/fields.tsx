import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export const inputClass =
  "min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-[15px] focus:border-ink focus:outline-none aria-[invalid=true]:border-brand";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-[13px] text-brand-hover">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({ error, className, ...props }: ComponentProps<"input"> & { error?: string }) {
  return (
    <input
      {...props}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${props.id}-error` : undefined}
      className={cn(inputClass, className)}
    />
  );
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(inputClass, "py-2.5 leading-relaxed", className)} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select {...props} className={cn(inputClass, "pr-8", className)} />;
}

export function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 md:p-5">
      <legend className="px-1 text-base font-extrabold">{legend}</legend>
      {children}
    </fieldset>
  );
}

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  draft: { label: "Nháp", tone: "bg-placeholder text-ink" },
  pending: { label: "Chờ duyệt", tone: "bg-info-bg text-info" },
  published: { label: "Đang hiện", tone: "bg-ok-bg text-ok" },
  expired: { label: "Hết hạn", tone: "bg-warn-bg text-warn" },
  paused: { label: "Tạm dừng", tone: "bg-placeholder text-ink" },
};

export function StatusPill({ status }: { status: string }) {
  const s = STATUS_LABEL[status] ?? { label: status, tone: "bg-placeholder text-ink" };
  return <span className={cn("inline-flex rounded-sm px-2 py-0.5 text-xs font-bold whitespace-nowrap", s.tone)}>{s.label}</span>;
}
