import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { couponListPath, dealPath } from "@/lib/links";
import { activeCouponWhere } from "@/lib/queries/coupons";
import { SITE_URL } from "@/lib/site";

// Đọc DB mỗi lần Google gọi (không tạo lúc build)
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [deals, couponPlatforms] = await Promise.all([
    // Deal hết hạn vẫn giữ trong sitemap vì trang vẫn tồn tại
    db.deal.findMany({ where: { status: { in: ["published", "expired"] } }, select: { slug: true, updatedAt: true, status: true }, orderBy: { updatedAt: "desc" }, take: 45000 }),
    db.coupon.groupBy({ by: ["platformId"], where: activeCouponWhere() }),
  ]);
  const platforms = await db.platform.findMany({ where: { id: { in: couponPlatforms.map((c) => c.platformId) } }, select: { slug: true } });
  const now = new Date();
  const url = (path: string) => `${SITE_URL}${path}`;

  return [
    { url: url("/"), lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: url("/ma-giam-gia"), lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: url("/gia-re"), lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    ...platforms.map((p) => ({ url: url(couponListPath(p.slug)), lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...deals.map((d) => ({
      url: url(dealPath(d.slug)),
      lastModified: d.updatedAt,
      changeFrequency: "daily" as const,
      priority: d.status === "published" ? 0.7 : 0.3,
    })),
  ];
}
