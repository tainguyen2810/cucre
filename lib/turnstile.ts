import "server-only";

/**
 * Xác minh Cloudflare Turnstile (miễn phí) nếu đã cấu hình TURNSTILE_SECRET_KEY.
 * Chưa cấu hình thì bỏ qua (vẫn còn honeypot + giới hạn tần suất).
 */
export async function verifyTurnstile(token: string | null, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) });
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}
