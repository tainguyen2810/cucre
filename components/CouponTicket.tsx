import { CopyCodeButton } from "@/components/CopyCodeButton";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { isExpired } from "@/components/DealCard";
import { cn } from "@/lib/cn";
import { formatShortDate, formatShortVnd } from "@/lib/format";
import { SPONSORED_LINK, goCoupon } from "@/lib/links";

export type CouponTicketData = {
  id: number;
  code: string | null;
  title: string;
  maxDiscount: number | null;
  usedPercent: number;
  status: string;
  expiresAt: Date | null;
  platform: { name: string };
  category?: { name: string } | null;
};

/** Nhãn ngắn ở cuống vé: "-12%", "-50k", "Freeship"... */
export function couponHeadline(c: Pick<CouponTicketData, "title" | "maxDiscount">): string {
  if (/freeship|miễn phí vận chuyển/i.test(c.title)) return "Freeship";
  const percent = c.title.match(/(\d{1,2})\s?%/);
  if (percent) return `-${percent[1]}%`;
  if (c.maxDiscount) return `-${formatShortVnd(c.maxDiscount)}`;
  return "Ưu đãi";
}

export function CouponTicket({ coupon }: { coupon: CouponTicketData }) {
  const expired = isExpired(coupon);
  const href = goCoupon(coupon.id);
  const meta = [coupon.category?.name, coupon.expiresAt ? `HSD ${formatShortDate(coupon.expiresAt)}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={cn("flex overflow-hidden rounded-xl border border-line bg-surface", expired && "opacity-60")}
      aria-label={`Mã giảm giá ${coupon.platform.name}: ${coupon.title}`}
    >
      <div className="flex w-[92px] shrink-0 flex-col items-center justify-center gap-0.5 border-r-2 border-dashed border-brand-line bg-brand-soft px-1 text-center">
        <span className="text-xl leading-tight font-extrabold text-brand">{couponHeadline(coupon)}</span>
        <span className="text-xs font-semibold text-muted">{coupon.platform.name}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 px-4 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold leading-snug">{coupon.title}</h3>
          {expired ? <Badge tone="expired">Đã hết hạn</Badge> : null}
        </div>
        {meta ? <p className="text-[13px] text-muted">{meta}</p> : null}
        {coupon.usedPercent > 0 && !expired ? (
          <div className="flex items-center gap-2 text-xs text-muted">
            <div
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-placeholder"
              role="progressbar"
              aria-valuenow={coupon.usedPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Lượt dùng"
            >
              <div className="h-full rounded-full bg-progress" style={{ width: `${Math.min(coupon.usedPercent, 100)}%` }} />
            </div>
            <span>Đã dùng {coupon.usedPercent}%</span>
          </div>
        ) : null}
        {expired ? null : coupon.code ? (
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md border border-dashed border-line-strong px-2.5 py-2.5 text-center font-mono font-bold">
              {coupon.code}
            </code>
            <CopyCodeButton code={coupon.code} href={href} />
          </div>
        ) : (
          <a href={href} {...SPONSORED_LINK} className={buttonClass("primary", "md", "self-start")}>
            Lấy ưu đãi
          </a>
        )}
      </div>
    </article>
  );
}
