import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { ImageBox, firstImage } from "@/components/ui/ImageBox";
import { Price } from "@/components/ui/Price";
import { placePath } from "@/lib/links";

export const PLACE_TYPE_LABEL: Record<string, string> = {
  restaurant: "Quán ăn",
  cafe: "Cà phê",
  buffet: "Buffet",
  spa: "Spa",
  massage: "Massage",
  salon: "Salon",
  other: "Khác",
};

export type PlaceCardData = {
  name: string;
  slug: string;
  type: string;
  district: string;
  ward: string | null;
  images: unknown;
  vouchers: { title: string; price: number; oldPrice: number | null }[];
  distance?: number | null;
};

export function PlaceCard({ place }: { place: PlaceCardData }) {
  const voucher = place.vouchers[0];
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
      <Link href={placePath(place.slug)} tabIndex={-1} aria-hidden>
        <ImageBox src={firstImage(place.images)} alt="">
          <Badge tone="platform" className="absolute top-2.5 left-2.5">
            {PLACE_TYPE_LABEL[place.type] ?? place.type}
          </Badge>
        </ImageBox>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">
          <Link href={placePath(place.slug)} className="hover:text-brand">
            {place.name}
          </Link>
        </h3>
        <p className="flex items-center gap-1 text-[13px] text-muted">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          {[place.ward, place.district].filter(Boolean).join(", ")}
          {place.distance != null ? <span className="ml-auto font-semibold text-ink">{place.distance < 1 ? `${Math.round(place.distance * 1000)} m` : `${place.distance.toFixed(1)} km`}</span> : null}
        </p>
        {voucher ? (
          <>
            <p className="text-sm">{voucher.title}</p>
            {voucher.price > 0 ? <Price price={voucher.price} oldPrice={voucher.oldPrice} /> : null}
          </>
        ) : null}
        <div className="mt-auto pt-1">
          <Link href={placePath(place.slug)} className={buttonClass("outline", "md", "w-full")}>
            Nhận voucher
          </Link>
        </div>
      </div>
    </article>
  );
}
