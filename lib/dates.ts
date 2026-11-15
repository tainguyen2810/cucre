const DAY = 24 * 60 * 60 * 1000;

/** Thời điểm n ngày trước */
export function daysAgo(n: number): Date {
  return new Date(Date.now() - n * DAY);
}

/** Ngày (giờ VN) dạng YYYY-MM-DD */
export function vnDay(date: Date): string {
  return date.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
}
