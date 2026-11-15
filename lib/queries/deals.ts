import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

/** Trường cần cho DealCard */
export const dealCardSelect = {
  id: true,
  title: true,
  slug: true,
  images: true,
  price: true,
  oldPrice: true,
  discountPercent: true,
  techVerdict: true,
  status: true,
  expiresAt: true,
  platform: { select: { name: true } },
} satisfies Prisma.DealSelect;

/** Deal đang hiển thị được: đã đăng và chưa quá hạn */
export function activeDealWhere(): Prisma.DealWhereInput {
  return { status: "published", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };
}

/** Chi tiết deal theo slug (dùng chung cho generateMetadata và page, chỉ truy vấn 1 lần). */
export const getDealBySlug = cache(async (slug: string) => {
  const deal = await db.deal.findUnique({
    where: { slug },
    include: {
      platform: true,
      category: { include: { parent: true } },
      coupons: {
        where: { status: "published", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
        include: { platform: true, category: true },
        take: 4,
      },
      priceHistory: {
        where: { recordedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        orderBy: { recordedAt: "asc" },
        select: { price: true, recordedAt: true },
      },
    },
  });
  // Nháp và chờ duyệt không hiển thị công khai
  if (!deal || deal.status === "draft" || deal.status === "pending") return null;
  return deal;
});

export async function getSimilarDeals(deal: { id: number; type: Prisma.DealWhereInput["type"]; categoryId: number | null }, take = 4) {
  const base = { ...activeDealWhere(), id: { not: deal.id } };
  const sameCategory = deal.categoryId
    ? await db.deal.findMany({ where: { ...base, categoryId: deal.categoryId }, select: dealCardSelect, orderBy: { publishedAt: "desc" }, take })
    : [];
  if (sameCategory.length >= take) return sameCategory;
  // Bổ sung bằng deal cùng mảng
  const more = await db.deal.findMany({
    where: { ...base, type: deal.type, id: { notIn: [deal.id, ...sameCategory.map((d) => d.id)] } },
    select: dealCardSelect,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: take - sameCategory.length,
  });
  return [...sameCategory, ...more];
}
