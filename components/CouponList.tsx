import Link from "next/link";
import type { ReactNode } from "react";
import { CouponTicket, type CouponTicketData } from "@/components/CouponTicket";
import { ChipLink } from "@/components/ui/Chip";
import { couponListPath } from "@/lib/links";
import { hrefWith } from "@/lib/url";

type Props = {
  title: string;
  intro: string;
  /** slug sàn đang chọn (undefined = tất cả) */
  platformSlug?: string;
  platforms: { name: string; slug: string; count: number }[];
  industries: { name: string; slug: string }[];
  industry?: string;
  showExpired: boolean;
  coupons: CouponTicketData[];
  /** Khối chèn dưới bộ lọc (vd. lịch sale) */
  aside?: ReactNode;
};

/** Nội dung dùng chung cho /ma-giam-gia và /ma-giam-gia/[san] */
export function CouponList({ title, intro, platformSlug, platforms, industries, industry, showExpired, coupons, aside }: Props) {
  const base = couponListPath(platformSlug);
  const current = { nganh: industry, "het-han": showExpired ? "1" : undefined };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl leading-tight font-extrabold md:text-page">{title}</h1>
        <p className="max-w-2xl text-muted">{intro}</p>
      </header>

      <div className="flex flex-col gap-3">
        <nav aria-label="Lọc theo sàn" className="-mx-4 md:mx-0">
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 md:flex-wrap md:px-0">
            <ChipLink href={hrefWith(couponListPath(), current, {})} active={!platformSlug}>
              Tất cả sàn
            </ChipLink>
            {platforms.map((p) => (
              <ChipLink key={p.slug} href={hrefWith(couponListPath(p.slug), current, {})} active={p.slug === platformSlug}>
                {p.name} <span className="ml-1 opacity-70">{p.count}</span>
              </ChipLink>
            ))}
          </div>
        </nav>
        {industries.length > 0 ? (
          <nav aria-label="Lọc theo ngành" className="-mx-4 md:mx-0">
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 md:flex-wrap md:px-0">
              <ChipLink href={hrefWith(base, current, { nganh: undefined })} active={!industry}>
                Mọi ngành
              </ChipLink>
              {industries.map((c) => (
                <ChipLink key={c.slug} href={hrefWith(base, current, { nganh: c.slug })} active={c.slug === industry}>
                  {c.name}
                </ChipLink>
              ))}
            </div>
          </nav>
        ) : null}
      </div>

      {aside}

      {coupons.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {coupons.map((c) => (
            <CouponTicket key={c.id} coupon={c} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-line bg-surface p-6 text-center text-muted">
          {showExpired ? "Chưa có mã nào hết hạn ở mục này." : "Hiện chưa có mã đang chạy ở mục này. Quay lại sau nhé, mã mới được cập nhật hằng ngày."}
        </p>
      )}

      <p className="text-sm">
        <Link
          href={hrefWith(base, current, { "het-han": showExpired ? undefined : "1" })}
          className="inline-flex min-h-11 items-center font-bold text-brand hover:text-brand-hover"
        >
          {showExpired ? "← Xem mã đang chạy" : "Xem mã đã hết hạn"}
        </Link>
      </p>
    </div>
  );
}
