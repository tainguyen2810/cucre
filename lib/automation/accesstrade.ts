import { detectPlatform } from "./platforms";
import type { ImportedCoupon } from "./types";

/*
 * Adapter Accesstrade – API "offers_informations" (khuyến mãi + mã giảm giá).
 * Tài liệu: https://developers.accesstrade.vn  (header: Authorization: Token <API_KEY>)
 * LƯU Ý: viết theo cấu trúc phản hồi phổ biến của API này; khi có tài khoản, đối chiếu lại tài liệu
 * thật và chỉnh hàm `normalize` nếu tên trường khác. Mọi mục nhập đều vào trạng thái chờ duyệt.
 */

type RawOffer = {
  id?: string | number;
  name?: string;
  content?: string;
  merchant?: string;
  domain?: string;
  link?: string;
  aff_link?: string;
  start_time?: string;
  end_time?: string;
  coupons?: { coupon_code?: string; coupon_desc?: string }[];
};

function parseDate(v?: string): Date | null {
  if (!v) return null;
  // "2026-12-31 23:59:59" (giờ VN) hoặc ISO
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(v) ? `${v.replace(" ", "T")}+07:00` : v;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

const clean = (s?: string) => (s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export function normalizeAccesstrade(raw: RawOffer[]): ImportedCoupon[] {
  const out: ImportedCoupon[] = [];
  for (const o of raw) {
    const url = o.aff_link || o.link;
    if (!o.id || !o.name || !url || !/^https?:\/\//.test(url)) continue;
    const platform = detectPlatform(o.merchant ?? "", o.domain);
    const base = {
      source: "accesstrade",
      platformSlug: platform.slug,
      platformName: platform.name,
      url,
      startsAt: parseDate(o.start_time),
      expiresAt: parseDate(o.end_time),
    };
    const coupons = (o.coupons ?? []).filter((c) => c.coupon_code);
    if (coupons.length === 0) {
      out.push({ ...base, externalId: `at-${o.id}`, title: clean(o.name).slice(0, 255), code: null, conditions: clean(o.content).slice(0, 2000) || null });
    } else {
      for (const c of coupons) {
        const code = String(c.coupon_code).trim().toUpperCase().slice(0, 64);
        out.push({
          ...base,
          externalId: `at-${o.id}-${code}`.slice(0, 191),
          title: clean(c.coupon_desc || o.name).slice(0, 255),
          code,
          conditions: clean(o.content).slice(0, 2000) || null,
        });
      }
    }
  }
  return out;
}

export async function fetchAccesstradeCoupons(apiKey: string, baseUrl = "https://api.accesstrade.vn"): Promise<ImportedCoupon[]> {
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/offers_informations?status=1&limit=200`, {
    headers: { Authorization: `Token ${apiKey}`, Accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Accesstrade trả lỗi HTTP ${res.status}`);
  const body = (await res.json()) as { data?: RawOffer[] } | RawOffer[];
  return normalizeAccesstrade(Array.isArray(body) ? body : (body.data ?? []));
}
