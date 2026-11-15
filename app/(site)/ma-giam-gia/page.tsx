import type { Metadata } from "next";
import { CouponList } from "@/components/CouponList";
import { categoryWithChildrenIds, couponIndustries, getCoupons, platformsWithCoupons } from "@/lib/queries/coupons";
import { param } from "@/lib/url";

const monthYear = () => new Intl.DateTimeFormat("vi-VN", { month: "numeric", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());

export async function generateMetadata({ searchParams }: PageProps<"/ma-giam-gia">): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Boolean(param(sp, "nganh") || param(sp, "het-han"));
  return {
    title: `Mã giảm giá hôm nay – Shopee, Lazada, TikTok Shop tháng ${monthYear()}`,
    description: "Tổng hợp mã giảm giá, freeship còn hạn trên Shopee, Lazada, TikTok Shop, Tiki, Klook, Agoda. Cập nhật mỗi ngày, bấm là sao chép.",
    alternates: { canonical: "/ma-giam-gia" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function CouponsPage({ searchParams }: PageProps<"/ma-giam-gia">) {
  const sp = await searchParams;
  const industry = param(sp, "nganh");
  const showExpired = param(sp, "het-han") === "1";
  const categoryIds = industry ? await categoryWithChildrenIds(industry) : undefined;

  const [platforms, industries, coupons] = await Promise.all([
    platformsWithCoupons(),
    couponIndustries(),
    getCoupons({ categoryIds: categoryIds ?? undefined, expired: showExpired }),
  ]);

  return (
    <CouponList
      title="Mã giảm giá hôm nay"
      intro={`Mã còn hạn tháng ${monthYear()} từ các sàn lớn. Bấm “Sao chép” để chép mã và mở trang sàn.`}
      platforms={platforms}
      industries={industries}
      industry={categoryIds ? industry : undefined}
      showExpired={showExpired}
      coupons={coupons}
    />
  );
}
