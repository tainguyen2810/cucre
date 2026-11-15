/** Chuẩn hóa SĐT di động VN về dạng 0xxxxxxxxx; trả null nếu không hợp lệ. */
export function normalizeVnPhone(input: string): string | null {
  let digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+84")) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith("84") && digits.length === 11) digits = `0${digits.slice(2)}`;
  digits = digits.replace(/\D/g, "");
  return /^0(3|5|7|8|9)\d{8}$/.test(digits) ? digits : null;
}

/** 0901234567 → 0901 *** 567 (hiển thị che bớt) */
export function maskPhone(phone: string): string {
  return phone.length >= 10 ? `${phone.slice(0, 4)} *** ${phone.slice(-3)}` : phone;
}
