import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CouponTicket } from "@/components/CouponTicket";
import { DealCard } from "@/components/DealCard";
import { PlaceCard } from "@/components/PlaceCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChipLink } from "@/components/ui/Chip";
import { Pagination } from "@/components/ui/Pagination";
import { Price } from "@/components/ui/Price";
import { db } from "@/lib/db";

// Trang xem thử component – chỉ dùng khi phát triển, không có trên production.
export const metadata: Metadata = { title: "Xem thử giao diện", robots: { index: false, follow: false } };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-section font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

export default async function UiPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const [deals, coupons, places] = await Promise.all([
    db.deal.findMany({ take: 4, orderBy: { publishedAt: "desc" }, include: { platform: true } }),
    db.coupon.findMany({ take: 3, orderBy: { expiresAt: "asc" }, include: { platform: true, category: true } }),
    db.place.findMany({ take: 4, include: { vouchers: { take: 1 } } }),
  ]);

  // Một deal và một coupon hết hạn để xem trạng thái "Đã hết hạn"
  const expiredDeal = deals[3] ? { ...deals[3], status: "expired" as const } : null;
  const expiredCoupon = coupons[2] ? { ...coupons[2], status: "expired" as const } : null;

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-page font-extrabold">Xem thử giao diện</h1>
        <p className="text-muted">Các thành phần dùng chung, dữ liệu lấy từ database mẫu. Chỉ hiện khi chạy local.</p>
      </header>

      <Section title="Nút & chip">
        <div className="flex flex-wrap gap-3">
          <Button>Lấy deal</Button>
          <Button variant="dark">Nhận deal qua Zalo</Button>
          <Button variant="outline">Nhận voucher</Button>
          <Button variant="light">Chỉ đường</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <ChipLink href="/giao-dien" active>
            Tất cả
          </ChipLink>
          <ChipLink href="/giao-dien?san=shopee">Shopee</ChipLink>
          <ChipLink href="/giao-dien?san=lazada">Lazada</ChipLink>
          <ChipLink href="/giao-dien?gia=duoi-99k">Dưới 99k</ChipLink>
        </div>
      </Section>

      <Section title="Nhãn & giá">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="discount">-35%</Badge>
          <Badge tone="platform">Shopee</Badge>
          <Badge tone="flash">Flash sale 12.12</Badge>
          <Badge tone="verified">KTV đã kiểm tra</Badge>
          <Badge tone="verified">Chính hãng · Có hóa đơn</Badge>
          <Badge tone="info">Mới</Badge>
          <Badge tone="expired">Đã hết hạn</Badge>
        </div>
        <Price price={890000} oldPrice={1390000} size="lg" />
      </Section>

      <Section title="Thẻ deal">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {deals.slice(0, 3).map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
          {expiredDeal ? <DealCard deal={expiredDeal} /> : null}
        </div>
      </Section>

      <Section title="Vé mã giảm giá">
        <div className="grid gap-4 md:grid-cols-2">
          {coupons.slice(0, 2).map((c) => (
            <CouponTicket key={c.id} coupon={c} />
          ))}
          {expiredCoupon ? <CouponTicket coupon={expiredCoupon} /> : null}
        </div>
        <p className="max-w-[420px] rounded-md bg-warn-bg px-2.5 py-2 text-[13px] text-warn">
          <b>Lưu ý:</b> cổng HDMI chỉ 30Hz, đủ cho văn phòng.
        </p>
      </Section>

      <Section title="Thẻ quán">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {places.map((p) => (
            <PlaceCard key={p.id} place={p} />
          ))}
        </div>
      </Section>

      <Section title="Phân trang">
        <Pagination page={5} totalPages={12} basePath="/giao-dien" />
      </Section>
    </div>
  );
}
