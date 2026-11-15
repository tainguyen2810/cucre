import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Bắt buộc đăng nhập – gọi ở đầu MỌI trang và Server Action trong /admin. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session.user;
}

// Giới hạn thử đăng nhập: 5 lần sai / 15 phút cho mỗi IP (bộ nhớ trong tiến trình, đủ cho 1 server).
const attempts = new Map<string, { count: number; until: number }>();
const WINDOW = 15 * 60 * 1000;

export function loginBlocked(key: string): boolean {
  const a = attempts.get(key);
  return Boolean(a && a.until > Date.now() && a.count >= 5);
}

export function recordLoginFailure(key: string) {
  const a = attempts.get(key);
  if (!a || a.until < Date.now()) attempts.set(key, { count: 1, until: Date.now() + WINDOW });
  else a.count += 1;
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}
