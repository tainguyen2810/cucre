import { formatShortDate } from "../format";
import type { Db } from "./types";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const vnd = (n: number) => `${new Intl.NumberFormat("vi-VN").format(n)}đ`;

/** 5 deal nổi bật đang hiện (CHỈ deal đã duyệt – status published). Ưu tiên deal mới đăng. */
export async function pickDailyDeals(db: Db, take = 5) {
  const now = new Date();
  const featured = await db.deal.findMany({
    where: { status: "published", featured: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    orderBy: { publishedAt: "desc" },
    take,
    select: { id: true, title: true, slug: true, price: true, oldPrice: true, discountPercent: true, techVerdict: true, platform: { select: { name: true } } },
  });
  if (featured.length >= take) return featured;
  const more = await db.deal.findMany({
    where: { status: "published", featured: false, id: { notIn: featured.map((d) => d.id) }, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    orderBy: [{ discountPercent: "desc" }, { publishedAt: "desc" }],
    take: take - featured.length,
    select: { id: true, title: true, slug: true, price: true, oldPrice: true, discountPercent: true, techVerdict: true, platform: { select: { name: true } } },
  });
  return [...featured, ...more];
}

export function buildDailyMessage(deals: Awaited<ReturnType<typeof pickDailyDeals>>, siteUrl: string, date = new Date()): string {
  const day = formatShortDate(date);
  const lines = [`🔥 <b>${deals.length} deal hot hôm nay ${day}</b> – cucre.vn`, ""];
  deals.forEach((d, i) => {
    const off = d.discountPercent > 0 ? ` (-${d.discountPercent}%)` : "";
    lines.push(`${i + 1}. <b>${esc(d.title)}</b>`);
    lines.push(`💰 ${vnd(d.price)}${d.oldPrice ? ` <s>${vnd(d.oldPrice)}</s>` : ""}${off} · ${esc(d.platform.name)}`);
    if (d.techVerdict) lines.push(`🛠 KTV: ${esc(d.techVerdict)}`);
    lines.push(`👉 ${siteUrl.replace(/\/$/, "")}/deal/${d.slug}`);
    lines.push("");
  });
  lines.push("<i>cucre.vn có thể nhận hoa hồng khi bạn mua qua liên kết. Giá bạn trả không đổi.</i>");
  return lines.join("\n");
}

export async function sendTelegram(token: string, chatId: string, text: string, apiBase = "https://api.telegram.org") {
  const res = await fetch(`${apiBase.replace(/\/$/, "")}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    signal: AbortSignal.timeout(20_000),
  });
  const body = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string };
  if (!res.ok || !body.ok) throw new Error(`Telegram lỗi: ${body.description ?? `HTTP ${res.status}`}`);
}

/** Gửi tin hằng ngày; dryRun = chỉ trả nội dung, không gửi */
export async function runTelegramDaily(db: Db, env: Record<string, string | undefined> = process.env, dryRun = false) {
  const deals = await pickDailyDeals(db);
  if (deals.length === 0) return { ok: false, summary: "Không có deal đã duyệt nào để gửi", message: "" };
  const message = buildDailyMessage(deals, env.SITE_URL || env.NEXT_PUBLIC_SITE_URL || "https://cucre.vn");
  if (dryRun) return { ok: true, summary: `Xem trước ${deals.length} deal`, message };
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return { ok: false, summary: "Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong .env", message };
  try {
    await sendTelegram(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, message, env.TELEGRAM_API_URL || undefined);
    const summary = `Đã gửi ${deals.length} deal: ${deals.map((d) => `#${d.id}`).join(", ")}`;
    await db.jobRun.create({ data: { job: "telegram-daily", ok: true, summary } });
    return { ok: true, summary, message };
  } catch (error) {
    const summary = error instanceof Error ? error.message : String(error);
    await db.jobRun.create({ data: { job: "telegram-daily", ok: false, summary: summary.slice(0, 1000) } });
    return { ok: false, summary, message };
  }
}
