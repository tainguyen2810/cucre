// Tiện ích đọc form và đổi ngày giờ cho trang quản trị (giờ Việt Nam, UTC+7).

/** Date -> "2026-11-20T23:59" (giờ VN) cho <input type="datetime-local"> */
export function toLocalInput(date: Date | null | undefined): string {
  if (!date) return "";
  const vn = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return vn.toISOString().slice(0, 16);
}

/** "2026-11-20T23:59" (giờ VN) -> Date; chuỗi rỗng -> null */
export function fromLocalInput(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(`${value}:00+07:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Textarea mỗi dòng một ý -> string[] */
export function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** "1.290.000" hoặc "1290000" -> 1290000; rỗng -> null */
export function money(value: FormDataEntryValue | null): number | null {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> };
