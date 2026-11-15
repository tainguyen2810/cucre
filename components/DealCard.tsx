import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { ImageBox, firstImage } from "@/components/ui/ImageBox";
import { Price } from "@/components/ui/Price";
import { SPONSORED_LINK, dealPath, goDeal } from "@/lib/links";

export type DealCardData = {
  id: number;
  title: string;
  slug: string;
  images: unknown;
  price: number;
  oldPrice: number | null;
  discountPercent: number;
  techVerdict: string | null;
  status: string;
  expiresAt: Date | null;
  platform: { name: string };
};

export function isExpired(item: { status: string; expiresAt: Date | null }) {
  return item.status === "expired" || (item.expiresAt !== null && item.expiresAt.getTime() < Date.now());
}

export function DealCard({ deal }: { deal: DealCardData }) {
  const expired = isExpired(deal);
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
      <Link href={dealPath(deal.slug)} tabIndex={-1} aria-hidden>
        <ImageBox src={firstImage(deal.images)} alt="" className={expired ? "opacity-60" : undefined}>
          {deal.discountPercent > 0 && !expired ? (
            <Badge tone="discount" className="absolute top-2.5 left-2.5">
              -{deal.discountPercent}%
            </Badge>
          ) : null}
          {expired ? (
            <Badge tone="expired" className="absolute top-2.5 left-2.5">
              Đã hết hạn
            </Badge>
          ) : null}
          <Badge tone="platform" className="absolute top-2.5 right-2.5">
            {deal.platform.name}
          </Badge>
        </ImageBox>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">
          <Link href={dealPath(deal.slug)} className="hover:text-brand">
            {deal.title}
          </Link>
        </h3>
        <Price price={deal.price} oldPrice={deal.oldPrice} />
        {deal.techVerdict ? (
          <div className="rounded-md bg-ok-bg px-2.5 py-2 text-[13px] text-ok">
            <p className="line-clamp-3">
              <b>KTV nhận xét:</b> {deal.techVerdict}
            </p>
          </div>
        ) : null}
        <div className="mt-auto pt-1">
          {expired ? (
            <Link href={dealPath(deal.slug)} className={buttonClass("light", "md", "w-full")}>
              Xem tương tự
            </Link>
          ) : (
            <a href={goDeal(deal.id)} {...SPONSORED_LINK} className={buttonClass("primary", "md", "w-full")}>
              Lấy deal
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
