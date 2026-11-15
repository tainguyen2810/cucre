import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock, Clock, MapPin, Navigation } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ClaimForm } from "@/components/places/ClaimForm";
import { PlaceListing } from "@/components/places/PlaceListing";
import { PlaceMap } from "@/components/places/PlaceMap";
import { PLACE_TYPE_LABEL } from "@/components/PlaceCard";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { ImageBox } from "@/components/ui/ImageBox";
import { Price } from "@/components/ui/Price";
import { daysAgo } from "@/lib/dates";
import { formatShortDate } from "@/lib/format";
import { placePath } from "@/lib/links";
import { findDistrict, getPlaceBySlug } from "@/lib/queries/places";
import { SITE_URL } from "@/lib/site";
import { param } from "@/lib/url";

// /an-uong/[slug] là trang quận (vd. /an-uong/binh-tan) hoặc trang quán.

export async function generateMetadata({ params, searchParams }: PageProps<"/an-uong/[slug]">): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const district = await findDistrict(slug);
  if (district) {
    return {
      title: `Voucher ăn uống, spa ${district.district} – giảm giá hôm nay`,
      description: `Quán ăn, buffet, cà phê, spa ở ${district.district} có ưu đãi riêng trên cucre.vn. Nhận mã miễn phí bằng số điện thoại.`,
      alternates: { canonical: placePath(district.districtSlug) },
      robots: param(sp, "loai") || param(sp, "gan") ? { index: false, follow: true } : undefined,
    };
  }
  const place = await getPlaceBySlug(slug);
  if (!place) return {};
  const v = place.vouchers.find((x) => x.status === "published");
  return {
    title: `${place.name} – ${v ? v.title : "ưu đãi"}`,
    description: `${v ? `${v.title}. ` : ""}${place.address}, ${place.district}. Nhận voucher miễn phí bằng số điện thoại trên cucre.vn.`,
    alternates: { canonical: placePath(place.slug) },
  };
}

const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

export default async function PlaceOrDistrictPage({ params, searchParams }: PageProps<"/an-uong/[slug]">) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);

  const district = await findDistrict(slug);
  if (district) {
    return (
      <div className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: "Ăn uống & Spa", href: "/an-uong" }, { label: district.district }]} siteUrl={SITE_URL} />
        <PlaceListing searchParams={sp} districtSlug={district.districtSlug} title={`Ăn uống & Spa ${district.district}`} intro={`Ưu đãi từ quán và spa đối tác ở ${district.district}.`} />
      </div>
    );
  }

  const place = await getPlaceBySlug(slug);
  if (!place) notFound();
  const images = strings(place.images);
  const now = daysAgo(0).getTime();
  const active = place.vouchers.filter((v) => v.status === "published" && (!v.expiresAt || v.expiresAt.getTime() > now));
  const directions = place.lat && place.lng ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address} ${place.district}`)}`;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Ăn uống & Spa", href: "/an-uong" }, { label: place.district, href: placePath(place.districtSlug) }, { label: place.name }]} siteUrl={SITE_URL} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-2">
            <ImageBox src={images[0] ?? null} alt={place.name} className="aspect-[16/9] rounded-xl border border-line" sizes="(max-width: 1024px) 100vw, 700px" />
            {images.length > 1 ? (
              <ul className="no-scrollbar flex gap-2 overflow-x-auto">
                {images.slice(1, 8).map((src) => (
                  <li key={src} className="w-24 shrink-0">
                    <ImageBox src={src} alt="" className="rounded-md border border-line" sizes="96px" />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <header className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Badge tone="platform">{PLACE_TYPE_LABEL[place.type] ?? place.type}</Badge>
              <Badge tone="verified">Đối tác cucre.vn</Badge>
            </div>
            <h1 className="text-[28px] leading-tight font-extrabold md:text-page">{place.name}</h1>
            <p className="flex items-start gap-1.5 text-muted">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              {[place.address, place.ward, place.district, place.city].filter(Boolean).join(", ")}
            </p>
            {place.openingHours ? (
              <p className="flex items-center gap-1.5 text-muted">
                <Clock className="size-4 shrink-0" aria-hidden /> {place.openingHours}
              </p>
            ) : null}
            <a href={directions} target="_blank" rel="noopener" className={buttonClass("light", "md", "self-start")}>
              <Navigation className="size-4" aria-hidden /> Chỉ đường
            </a>
          </header>
          {place.description ? <p className="max-w-[68ch] whitespace-pre-line">{place.description}</p> : null}
          {place.lat && place.lng ? (
            <PlaceMap pins={[{ lat: place.lat, lng: place.lng, label: place.name.slice(0, 18), title: place.name }]} zoom={16} className="h-64 overflow-hidden rounded-xl border border-line" />
          ) : null}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start" aria-label="Ưu đãi">
          {active.length === 0 ? (
            <p className="rounded-xl border border-line bg-surface p-5 text-muted">Quán hiện chưa có ưu đãi đang chạy. Quay lại sau nhé!</p>
          ) : (
            active.map((v) => (
              <section key={v.id} className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 md:p-5" aria-labelledby={`voucher-${v.id}`}>
                <h2 id={`voucher-${v.id}`} className="text-lg font-extrabold">{v.title}</h2>
                {v.price > 0 ? <Price price={v.price} oldPrice={v.oldPrice} size="lg" /> : null}
                {v.expiresAt ? (
                  <p className="flex items-center gap-1.5 text-sm text-muted">
                    <CalendarClock className="size-4" aria-hidden /> Áp dụng đến {formatShortDate(v.expiresAt)}
                  </p>
                ) : null}
                {v.conditions ? (
                  <div className="rounded-md bg-warn-bg px-3 py-2 text-[13px] text-warn">
                    <b>Điều kiện:</b> {v.conditions}
                  </div>
                ) : null}
                <ClaimForm voucherId={v.id} placeName={place.name} />
              </section>
            ))
          )}
        </aside>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": ["spa", "massage", "salon"].includes(place.type) ? "HealthAndBeautyBusiness" : "Restaurant",
          name: place.name,
          image: images.map((src) => new URL(src, SITE_URL).toString()),
          address: { "@type": "PostalAddress", streetAddress: place.address, addressLocality: place.district, addressRegion: place.city, addressCountry: "VN" },
          ...(place.lat && place.lng ? { geo: { "@type": "GeoCoordinates", latitude: place.lat, longitude: place.lng } } : {}),
          ...(place.openingHours ? { openingHours: place.openingHours } : {}),
          url: new URL(placePath(place.slug), SITE_URL).toString(),
          ...(active[0]?.price ? { makesOffer: { "@type": "Offer", name: active[0].title, price: active[0].price, priceCurrency: "VND" } } : {}),
        }}
      />
    </div>
  );
}
