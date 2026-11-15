import { cookies } from "next/headers";
import { NearMeButton } from "@/components/places/NearMeButton";
import { PlaceMap, type MapPin } from "@/components/places/PlaceMap";
import { PlaceCard } from "@/components/PlaceCard";
import { ChipLink } from "@/components/ui/Chip";
import { formatShortVnd } from "@/lib/format";
import { placePath } from "@/lib/links";
import { PLACE_TYPES, listPlaces, placeDistricts } from "@/lib/queries/places";
import { REGION_COOKIE, REGIONS, parseRegion } from "@/lib/site";
import { type QueryParams, hrefWith, param } from "@/lib/url";

function parseNear(v?: string) {
  const m = v?.match(/^(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)$/);
  return m ? { lat: Number(m[1]), lng: Number(m[2]) } : undefined;
}

/** Danh sách quán dùng chung cho /an-uong và /an-uong/[quận] */
export async function PlaceListing({ searchParams, districtSlug, title, intro }: { searchParams: QueryParams; districtSlug?: string; title: string; intro: string }) {
  const region = parseRegion((await cookies()).get(REGION_COOKIE)?.value);
  const type = param(searchParams, "loai");
  const nearRaw = param(searchParams, "gan");
  const near = parseNear(nearRaw);
  const [places, districts] = await Promise.all([listPlaces({ region, type, districtSlug, near }), placeDistricts(region)]);
  const current = { loai: type, gan: near ? nearRaw : undefined };

  const pins: MapPin[] = places
    .filter((p) => p.lat !== null && p.lng !== null)
    .map((p) => ({
      lat: p.lat!,
      lng: p.lng!,
      title: p.name,
      href: placePath(p.slug),
      label: p.vouchers[0]?.price ? formatShortVnd(p.vouchers[0].price) : p.vouchers[0] ? "Ưu đãi" : p.name.slice(0, 14),
    }));
  const regionLabel = REGIONS.find((r) => r.value === region)?.label;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl leading-tight font-extrabold md:text-page">{title}</h1>
        <p className="max-w-2xl text-muted">{intro}</p>
      </header>

      <div className="flex flex-col gap-3">
        <nav aria-label="Loại hình" className="-mx-4 md:mx-0">
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 md:flex-wrap md:px-0">
            <NearMeButton active={Boolean(near)} />
            <ChipLink href={hrefWith(districtSlug ? placePath(districtSlug) : "/an-uong", current, { loai: undefined })} active={!type}>
              Tất cả
            </ChipLink>
            {PLACE_TYPES.filter((t) => t.value !== "other").map((t) => (
              <ChipLink key={t.value} href={hrefWith(districtSlug ? placePath(districtSlug) : "/an-uong", current, { loai: t.value })} active={type === t.value}>
                {t.label}
              </ChipLink>
            ))}
          </div>
        </nav>
        {districts.length > 0 ? (
          <nav aria-label="Quận" className="-mx-4 md:mx-0">
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 md:flex-wrap md:px-0">
              <ChipLink href={hrefWith("/an-uong", current, {})} active={!districtSlug}>
                {regionLabel === "Toàn quốc" ? "Mọi nơi" : `Cả ${regionLabel}`}
              </ChipLink>
              {districts.map((d) => (
                <ChipLink key={d.slug} href={hrefWith(placePath(d.slug), current, {})} active={d.slug === districtSlug}>
                  {d.name} <span className="ml-1 opacity-70">{d.count}</span>
                </ChipLink>
              ))}
            </div>
          </nav>
        ) : null}
      </div>

      {places.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="grid grid-cols-2 content-start gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {places.map((p) => (
              <PlaceCard key={p.id} place={p} />
            ))}
          </div>
          <PlaceMap pins={pins} className="order-first h-64 overflow-hidden rounded-xl border border-line md:h-80 lg:sticky lg:top-4 lg:order-none lg:h-[560px]" />
        </div>
      ) : (
        <p className="rounded-xl border border-line bg-surface p-6 text-center text-muted">
          Chưa có quán đối tác ở khu vực này. Chọn khu vực khác ở góc trên, hoặc{" "}
          <a href="/hop-tac" className="font-semibold text-brand underline">giới thiệu quán bạn yêu thích</a>.
        </p>
      )}
    </div>
  );
}
