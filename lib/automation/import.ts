import { toSearchText } from "../slug";
import { ensurePlatform } from "./platforms";
import type { Db, ImportResult, ImportedCoupon } from "./types";

/**
 * Lưu mã nhập tự động: mã MỚI vào trạng thái `pending` (chờ admin duyệt, không hiện công khai).
 * Mã đã có: chỉ cập nhật hạn dùng/link nếu còn đang chờ duyệt; mã admin đã duyệt/sửa thì giữ nguyên.
 * Bỏ qua mã đã hết hạn.
 */
export async function importCoupons(db: Db, items: ImportedCoupon[]): Promise<ImportResult> {
  const result: ImportResult = { fetched: items.length, created: 0, updated: 0, skipped: 0, errors: [] };
  const platformIds = new Map<string, number>();
  const now = Date.now();

  for (const item of items) {
    try {
      if (item.expiresAt && item.expiresAt.getTime() < now) {
        result.skipped++;
        continue;
      }
      let platformId = platformIds.get(item.platformSlug);
      if (!platformId) {
        platformId = await ensurePlatform(db, item.platformSlug, item.platformName, item.source);
        platformIds.set(item.platformSlug, platformId);
      }
      const existing = await db.coupon.findUnique({
        where: { platformId_externalId: { platformId, externalId: item.externalId } },
        select: { id: true, status: true },
      });
      if (existing) {
        if (existing.status === "pending") {
          await db.coupon.update({ where: { id: existing.id }, data: { expiresAt: item.expiresAt, url: item.url } });
          result.updated++;
        } else result.skipped++;
        continue;
      }
      await db.coupon.create({
        data: {
          platformId,
          externalId: item.externalId,
          code: item.code,
          title: item.title,
          titleSearch: toSearchText(item.title),
          conditions: item.conditions,
          url: item.url,
          startsAt: item.startsAt,
          expiresAt: item.expiresAt,
          status: "pending",
        },
      });
      result.created++;
    } catch (error) {
      result.errors.push(`${item.externalId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return result;
}

export async function logRun(db: Db, job: string, ok: boolean, summary: string) {
  await db.jobRun.create({ data: { job, ok, summary: summary.slice(0, 1000) } });
}

/** Chạy mọi nguồn đã cấu hình (có API key trong .env) */
export async function runCouponImport(db: Db, env: Record<string, string | undefined> = process.env): Promise<{ ok: boolean; summary: string }> {
  const parts: string[] = [];
  let ok = true;
  if (env.ACCESSTRADE_API_KEY) {
    try {
      const { fetchAccesstradeCoupons } = await import("./accesstrade");
      const items = await fetchAccesstradeCoupons(env.ACCESSTRADE_API_KEY, env.ACCESSTRADE_API_URL || undefined);
      const r = await importCoupons(db, items);
      parts.push(`Accesstrade: lấy ${r.fetched}, mới ${r.created} (chờ duyệt), cập nhật ${r.updated}, bỏ qua ${r.skipped}${r.errors.length ? `, lỗi ${r.errors.length}: ${r.errors.slice(0, 3).join("; ")}` : ""}`);
      if (r.errors.length) ok = false;
    } catch (error) {
      ok = false;
      parts.push(`Accesstrade lỗi: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (parts.length === 0) return { ok: false, summary: "Chưa cấu hình nguồn nào (thiếu ACCESSTRADE_API_KEY trong .env)" };
  const summary = parts.join(" | ");
  await logRun(db, "import-coupons", ok, summary);
  return { ok, summary };
}
