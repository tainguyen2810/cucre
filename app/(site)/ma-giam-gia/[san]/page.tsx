import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CouponList } from "@/components/CouponList";
import { SaleCalendar } from "@/components/SaleCalendar";
import { db } from "@/lib/db";
import { couponListPath } from "@/lib/links";
import { categoryWithChildrenIds, couponIndustries, getCoupons, platformsWithCoupons } from "@/lib/queries/coupons";
import { SITE_URL } from "@/lib/site";
import { param } from "@/lib/url";

const getPlatform = cache((slug: string) => db.platform.findUnique({ where: { slug }, select: { id: true, name: true, slug: true } }));
const monthYear = () => new Intl.DateTimeFormat("vi-VN", { month: "numeric", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());

export async function generateMetadata({ params, searchParams }: PageProps<"/ma-giam-gia/[san]">): Promise<Metadata> {
  const [{ san }, sp] = await Promise.all([params, searchParams]);
  const platform = await getPlatform(san);
  if (!platform) return {};
  const filtered = Boolean(param(sp, "nganh") || param(sp, "het-han"));
  return {
    title: `Mã giảm giá ${platform.name} tháng ${monthYear()} – còn hạn hôm nay`,
    description: `Mã giảm giá, freeship ${platform.name} còn hạn, cập nhật mỗi ngày. Kiểm tra điều kiện, bấm sao chép là dùng được.`,
    alternates: { canonical: couponListPath(platform.slug) },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function PlatformCouponsPage({ params, searchParams }: PageProps<"/ma-giam-gia/[san]">) {
  const [{ san }, sp] = await Promise.all([params, searchParams]);
  const platform = await getPlatform(san);
  if (!platform) notFound();

  const industry = param(sp, "nganh");
  const showExpired = param(sp, "het-han") === "1";
  const categoryIds = industry ? await categoryWithChildrenIds(industry) : undefined;

  const [platforms, industries, coupons] = await Promise.all([
    platformsWithCoupons(),
    couponIndustries(),
    getCoupons({ platformId: platform.id, categoryIds: categoryIds ?? undefined, expired: showExpired }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={[{ label: "Mã giảm giá", href: "/ma-giam-gia" }, { label: platform.name }]} siteUrl={SITE_URL} />
      <CouponList
        title={`Mã giảm giá ${platform.name}`}
        intro={`Mã ${platform.name} còn hạn tháng ${monthYear()}. Mã có số lượng giới hạn, nên dùng sớm.`}
        platformSlug={platform.slug}
        platforms={platforms}
        industries={industries}
        industry={categoryIds ? industry : undefined}
        showExpired={showExpired}
        coupons={coupons}
        aside={showExpired ? null : <SaleCalendar />}
      />
    </div>
  );
}
