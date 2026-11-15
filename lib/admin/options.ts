import "server-only";
import { db } from "@/lib/db";
import { formatShortDate } from "@/lib/format";
import { activeCouponWhere } from "@/lib/queries/coupons";

/** Dữ liệu cho các ô chọn trong form deal/coupon */
export async function formOptions() {
  const [platforms, categories, coupons] = await Promise.all([
    db.platform.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.category.findMany({ orderBy: [{ segment: "asc" }, { sortOrder: "asc" }], select: { id: true, name: true, segment: true, parent: { select: { name: true } } } }),
    db.coupon.findMany({ where: activeCouponWhere(), orderBy: { expiresAt: "asc" }, include: { platform: { select: { name: true } } } }),
  ]);
  return {
    platforms,
    categories: categories.map((c) => ({ id: c.id, name: c.name, segment: c.segment, parentName: c.parent?.name ?? null })),
    coupons: coupons.map((c) => ({
      id: c.id,
      platformId: c.platformId,
      label: `${c.platform.name}: ${c.title}${c.code ? ` (${c.code})` : ""}${c.expiresAt ? ` · HSD ${formatShortDate(c.expiresAt)}` : ""}`,
    })),
  };
}
