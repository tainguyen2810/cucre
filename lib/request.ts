import "server-only";
import { createHash } from "node:crypto";

// Bot, công cụ tìm kiếm và trình xem trước link (Zalo, Facebook, Telegram...) – không ghi click.
const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|facebot|zalo|telegram|whatsapp|skype|discord|slack|headless|lighthouse|curl|wget|python|go-http|axios|node-fetch|okhttp|java\//i;

export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  return BOT_PATTERN.test(userAgent);
}

/** IP thật của khách sau Nginx (x-forwarded-for / x-real-ip). */
export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip");
}

/**
 * Mã băm IP theo ngày (giờ VN): cùng người trong một ngày cho cùng mã, sang ngày khác đổi mã.
 * Không thể suy ngược ra IP. Không lưu IP thật.
 */
export function dailyIpHash(ip: string | null): string | null {
  if (!ip) return null;
  const day = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
  return createHash("sha256")
    .update(`${ip}|${day}|${process.env.AUTH_SECRET ?? ""}`)
    .digest("hex")
    .slice(0, 32);
}

/** Chỉ cho phép chuyển hướng tới link http/https hợp lệ. */
export function safeExternalUrl(url: string): URL | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed : null;
  } catch {
    return null;
  }
}
