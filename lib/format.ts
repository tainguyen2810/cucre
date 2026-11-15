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
