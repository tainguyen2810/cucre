import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

export const couponTicketInclude = {
  platform: { select: { name: true, slug: true } },
  category: { select: { name: true } },
} satisfies Prisma.CouponInclude;

export function activeCouponWhere(): Prisma.CouponWhereInput {
  return { status: "published", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };
}

export function expiredCouponWhere(): Prisma.CouponWhereInput {
  return { OR: [{ status: "expired" }, { status: "published", expiresAt: { lte: new Date() } }] };
}

/** id của danh mục và toàn bộ danh mục con trực tiếp */
export async function categoryWithChildrenIds(slug: string): Promise<number[] | null> {
  const cat = await db.category.findUnique({ where: { slug }, select: { id: true, children: { select: { id: true } } } });
  return cat ? [cat.id, ...cat.children.map((c) => c.id)] : null;
}

/** Ngành để lọc mã: danh mục gốc có ít nhất một mã đang chạy (tính cả danh mục con) */
export async function couponIndustries() {
  const roots = await db.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    select: { name: true, slug: true, id: true, children: { select: { id: true } } },
  });
  const counts = await db.coupon.groupBy({ by: ["categoryId"], where: activeCouponWhere(), _count: true });
  const has = new Set(counts.map((c) => c.categoryId));
  return roots.filter((r) => has.has(r.id) || r.children.some((c) => has.has(c.id)));
}

export async function getCoupons(opts: { platformId?: number; categoryIds?: number[]; expired?: boolean; take?: number }) {
  const where: Prisma.CouponWhereInput = {
    ...(opts.expired ? expiredCouponWhere() : activeCouponWhere()),
    ...(opts.platformId ? { platformId: opts.platformId } : {}),
    ...(opts.categoryIds ? { categoryId: { in: opts.categoryIds } } : {}),
  };
  return db.coupon.findMany({
    where,
    include: couponTicketInclude,
    orderBy: opts.expired ? [{ expiresAt: "desc" }] : [{ featured: "desc" }, { expiresAt: "asc" }],
    take: opts.take ?? 60,
  });
}

/** Sàn có mã đang chạy, kèm số mã */
export async function platformsWithCoupons() {
  const counts = await db.coupon.groupBy({ by: ["platformId"], where: activeCouponWhere(), _count: true });
  const platforms = await db.platform.findMany({
    where: { id: { in: counts.map((c) => c.platformId) } },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return platforms.map((p) => ({ ...p, count: counts.find((c) => c.platformId === p.id)?._count ?? 0 }));
}
