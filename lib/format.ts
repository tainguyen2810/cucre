const vnd = new Intl.NumberFormat("vi-VN");

/** 1290000 -> "1.290.000đ" */
export function formatVnd(value: number | bigint | null | undefined): string {
  if (value === null || value === undefined) return "";
  return `${vnd.format(value)}đ`;
}

/** % giảm làm tròn xuống, trả 0 nếu dữ liệu không hợp lệ. */
export function discountPercent(price: number, oldPrice?: number | null): number {
  if (!oldPrice || oldPrice <= 0 || price >= oldPrice) return 0;
  return Math.floor(((oldPrice - price) / oldPrice) * 100);
}

/** 50000 -> "50k", 1200000 -> "1,2tr" – dùng cho nhãn ngắn */
export function formatShortVnd(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tr`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return `${value}đ`;
}

/** Ngày dạng 15/12 */
export function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(date));
}
