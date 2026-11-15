import type { Metadata } from "next";
import { MapPin, Search } from "lucide-react";
import { DealListing, listingMetadata, readListingFilters } from "@/components/DealListing";
import { ChipLink } from "@/components/ui/Chip";
import { hotDestinations } from "@/lib/queries/listing";
import { hrefWith } from "@/lib/url";

const BASE = "/du-lich";

export async function generateMetadata({ searchParams }: PageProps<"/du-lich">): Promise<Metadata> {
  return listingMetadata(
    BASE,
    await searchParams,
    "Deal du lịch – khách sạn, tour, vé tham quan giá rẻ",
    "Khách sạn, tour, vé vui chơi giảm giá qua Klook, Agoda, Traveloka. Chọn theo điểm đến: Đà Lạt, Nha Trang, Phú Quốc…",
  );
}

export default async function TravelPage({ searchParams }: PageProps<"/du-lich">) {
  const sp = await searchParams;
  const current = readListingFilters(sp);
  const destinations = await hotDestinations();

  return (
    <DealListing
      segment="travel"
      basePath={BASE}
      tabs="category"
      title={current["diem-den"] ? `Deal du lịch ${current["diem-den"]}` : "Deal du lịch"}
      intro="Khách sạn, tour, vé tham quan giảm giá. Đặt qua đối tác uy tín, giá bạn trả không đổi."
      searchParams={sp}
      emptyText="Chưa có deal cho điểm đến này. Thử điểm đến khác hoặc xem tất cả."
    >
      <form action={BASE} role="search" className="relative max-w-xl">
        <label htmlFor="tim-diem-den" className="sr-only">
          Tìm điểm đến
        </label>
        <MapPin className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-brand" aria-hidden />
        <input
          id="tim-diem-den"
          name="q"
          type="search"
          defaultValue={current.q}
          placeholder="Bạn muốn đi đâu? VD: Đà Lạt, Phú Quốc"
          className="h-[46px] w-full rounded-lg border-2 border-brand bg-surface pr-12 pl-11 text-[15px] placeholder:text-subtle focus:outline-none"
        />
        <button type="submit" aria-label="Tìm" className="absolute top-0 right-0 inline-flex size-[46px] items-center justify-center text-brand">
          <Search className="size-5" aria-hidden />
        </button>
      </form>
      {destinations.length > 0 ? (
        <section aria-labelledby="diem-den-hot" className="flex flex-col gap-2">
          <h2 id="diem-den-hot" className="text-sm font-bold uppercase tracking-wide text-muted">
            Điểm đến hot
          </h2>
          <div className="-mx-4 md:mx-0">
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 md:flex-wrap md:px-0">
              {current["diem-den"] ? (
                <ChipLink href={hrefWith(BASE, current, { "diem-den": undefined })}>Mọi điểm đến</ChipLink>
              ) : null}
              {destinations.map((d) => (
                <ChipLink key={d.name} href={hrefWith(BASE, { ...current, q: undefined }, { "diem-den": d.name })} active={current["diem-den"] === d.name}>
                  {d.name} <span className="ml-1 opacity-70">{d.count}</span>
                </ChipLink>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </DealListing>
  );
}
