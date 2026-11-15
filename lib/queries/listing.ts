import "server-only";
import { db } from "@/lib/db";
import type { Prisma, Segment } from "@/lib/generated/prisma/client";
import { categoryWithChildrenIds } from "@/lib/queries/coupons";
import { activeDealWhere, dealCardSelect } from "@/lib/queries/deals";
import { toSearchText } from "@/lib/slug";

export const PAGE_SIZE = 24;

export const PRICE_TABS = [
  { value: undefined, label: "Tất cả" },
  { value: "duoi-99k", label: "Dưới 99k", min: 0, max: 99_000 },
  { value: "99k-299k", label: "99k – 299k", min: 99_000, max: 300_000 },
  { value: "300k-999k", label: "300k – 999k", min: 300_000, max: 1_000_000 },
  { value: "tren-1-trieu", label: "Trên 1 triệu", min: 1_000_000 },
] as const;

export const SORTS = [
  { value: "moi-nhat", label: "Mới nhất" },
  { value: "giam-nhieu", label: "Giảm nhiều nhất" },
  { value: "gia-thap", label: "Giá thấp đến cao" },
  { value: "gia-cao", label: "Giá cao đến thấp" },
] as const;

const ORDER: Record<string, Prisma.DealOrderByWithRelationInput[]> = {
  "moi-nhat": [{ publishedAt: "desc" }, { id: "desc" }],
  "giam-nhieu": [{ discountPercent: "desc" }, { publishedAt: "desc" }],
  "gia-thap": [{ price: "asc" }, { id: "desc" }],
  "gia-cao": [{ price: "desc" }, { id: "desc" }],
};

export type DealListingFilters = { gia?: string; danhMuc?: string; san?: string; sapXep?: string; diemDen?: string; q?: string; page: number };

/** Danh sách deal của một mảng, có lọc/sắp xếp/phân trang */
export async function listDeals(segment: Segment, f: DealListingFilters) {
  const tab = PRICE_TABS.find((t) => t.value === f.gia);
  const priceWhere: Prisma.IntFilter | undefined =
    tab && "min" in tab ? { gte: tab.min, ...("max" in tab ? { lt: tab.max } : {}) } : undefined;
  const categoryIds = f.danhMuc ? await categoryWithChildrenIds(f.danhMuc) : null;
  const platform = f.san ? await db.platform.findUnique({ where: { slug: f.san }, select: { id: true } }) : null;

  const where: Prisma.DealWhereInput = {
    ...activeDealWhere(),
    type: segment,
    ...(priceWhere ? { price: priceWhere } : {}),
    ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
    ...(platform ? { platformId: platform.id } : {}),
    ...(f.diemDen ? { destination: f.diemDen } : {}),
    ...(f.q ? { AND: toSearchText(f.q).split(" ").filter((w) => w.length >= 2).slice(0, 6).map((w) => ({ OR: [{ titleSearch: { contains: w } }, { destination: { contains: w } }] })) } : {}),
  };

  const [total, deals] = await Promise.all([
    db.deal.count({ where }),
    db.deal.findMany({
      where,
      select: dealCardSelect,
      orderBy: ORDER[f.sapXep ?? ""] ?? ORDER["moi-nhat"],
      skip: (f.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  return { total, deals, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Danh mục (gốc + con) và sàn có deal của mảng, cho ô lọc */
export async function listingFilterOptions(segment: Segment) {
  const [categories, platformIds] = await Promise.all([
    db.category.findMany({
      where: { segment, parentId: null },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true, children: { orderBy: { sortOrder: "asc" }, select: { name: true, slug: true } } },
    }),
    db.deal.groupBy({ by: ["platformId"], where: { ...activeDealWhere(), type: segment } }),
  ]);
  const platforms = await db.platform.findMany({
    where: { id: { in: platformIds.map((p) => p.platformId) } },
    orderBy: { sortOrder: "asc" },
    select: { name: true, slug: true },
  });
  return { categories, platforms };
}

/** Điểm đến có nhiều deal du lịch đang chạy nhất */
export async function hotDestinations(take = 8) {
  const rows = await db.deal.groupBy({
    by: ["destination"],
    where: { ...activeDealWhere(), type: "travel", destination: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { destination: "desc" } },
    take,
  });
  return rows.filter((r) => r.destination).map((r) => ({ name: r.destination as string, count: r._count._all }));
}
