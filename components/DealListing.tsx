import type { ReactNode } from "react";
import { AutoSubmitSelect } from "@/components/AutoSubmitSelect";
import { DealCard } from "@/components/DealCard";
import { Button } from "@/components/ui/Button";
import { ChipLink } from "@/components/ui/Chip";
import { Pagination } from "@/components/ui/Pagination";
import type { Segment } from "@/lib/generated/prisma/client";
import { PRICE_TABS, SORTS, listDeals, listingFilterOptions } from "@/lib/queries/listing";
import { type QueryParams, hrefWith, pageParam, param } from "@/lib/url";

export const LISTING_KEYS = ["gia", "danh-muc", "san", "sap-xep", "diem-den", "q"] as const;

export function readListingFilters(sp: QueryParams) {
  return Object.fromEntries(LISTING_KEYS.map((k) => [k, param(sp, k)])) as Record<(typeof LISTING_KEYS)[number], string | undefined>;
}

export function listingIsFiltered(sp: QueryParams) {
  return Object.values(readListingFilters(sp)).some(Boolean);
}

type Props = {
  segment: Segment;
  basePath: string;
  title: string;
  intro: string;
  searchParams: QueryParams;
  /** Hiện tab mức giá (Giá rẻ, Kỹ thuật số) hay tab danh mục (Du lịch) */
  tabs: "price" | "category";
  /** Nội dung chèn giữa tiêu đề và bộ lọc (ô tìm điểm đến, điểm đến hot…) */
  children?: ReactNode;
  emptyText?: string;
};

/** Trang danh sách deal dùng chung cho /gia-re, /ky-thuat-so, /du-lich */
export async function DealListing({ segment, basePath, title, intro, searchParams, tabs, children, emptyText }: Props) {
  const current = readListingFilters(searchParams);
  const page = pageParam(searchParams);
  const [{ deals, total, totalPages }, { categories, platforms }] = await Promise.all([
    listDeals(segment, {
      gia: current.gia,
      danhMuc: current["danh-muc"],
      san: current.san,
      sapXep: current["sap-xep"],
      diemDen: current["diem-den"],
      q: current.q,
      page,
    }),
    listingFilterOptions(segment),
  ]);
  const tabCategories = categories.flatMap((root) => (root.children.length ? root.children : [root]));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl leading-tight font-extrabold md:text-page">{title}</h1>
        <p className="max-w-2xl text-muted">{intro}</p>
      </header>

      {children}

      <nav aria-label={tabs === "price" ? "Mức giá" : "Loại hình"} className="-mx-4 md:mx-0">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 md:flex-wrap md:px-0">
          {tabs === "price"
            ? PRICE_TABS.map((t) => (
                <ChipLink key={t.label} href={hrefWith(basePath, current, { gia: t.value })} active={current.gia === t.value}>
                  {t.label}
                </ChipLink>
              ))
            : [
                <ChipLink key="all" href={hrefWith(basePath, current, { "danh-muc": undefined })} active={!current["danh-muc"]}>
                  Tất cả
                </ChipLink>,
                ...tabCategories.map((c) => (
                  <ChipLink key={c.slug} href={hrefWith(basePath, current, { "danh-muc": c.slug })} active={current["danh-muc"] === c.slug}>
                    {c.name}
                  </ChipLink>
                )),
              ]}
        </div>
      </nav>

      <form action={basePath} className="flex flex-wrap items-end gap-3" aria-label="Lọc và sắp xếp">
        {(["gia", "diem-den", "q"] as const).map((k) => (current[k] ? <input key={k} type="hidden" name={k} value={current[k]} /> : null))}
        {tabs === "price" ? (
          <div className="flex flex-col gap-1">
            <label htmlFor="loc-danh-muc" className="text-xs font-semibold text-muted">
              Danh mục
            </label>
            <AutoSubmitSelect id="loc-danh-muc" name="danh-muc" defaultValue={current["danh-muc"] ?? ""}>
              <option value="">Tất cả danh mục</option>
              {categories.map((root) => (
                <optgroup key={root.slug} label={root.name}>
                  <option value={root.slug}>Tất cả {root.name.toLowerCase()}</option>
                  {root.children.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </AutoSubmitSelect>
          </div>
        ) : current["danh-muc"] ? (
          <input type="hidden" name="danh-muc" value={current["danh-muc"]} />
        ) : null}
        <div className="flex flex-col gap-1">
          <label htmlFor="loc-san" className="text-xs font-semibold text-muted">
            {segment === "travel" ? "Nền tảng" : "Sàn"}
          </label>
          <AutoSubmitSelect id="loc-san" name="san" defaultValue={current.san ?? ""}>
            <option value="">Tất cả</option>
            {platforms.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </AutoSubmitSelect>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="sap-xep" className="text-xs font-semibold text-muted">
            Sắp xếp
          </label>
          <AutoSubmitSelect id="sap-xep" name="sap-xep" defaultValue={current["sap-xep"] ?? "moi-nhat"}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </AutoSubmitSelect>
        </div>
        <noscript>
          <Button type="submit" variant="dark">
            Lọc
          </Button>
        </noscript>
        <p className="ml-auto self-center text-sm text-muted" aria-live="polite">
          {total} deal
        </p>
      </form>

      {deals.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {deals.map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-line bg-surface p-6 text-center text-muted">{emptyText ?? "Không có deal phù hợp bộ lọc. Thử bỏ bớt điều kiện lọc."}</p>
      )}

      <Pagination page={page} totalPages={totalPages} basePath={basePath} searchParams={current} />
    </div>
  );
}

/** Metadata chung: canonical về trang gốc, noindex khi có bộ lọc */
export function listingMetadata(basePath: string, sp: QueryParams, title: string, description: string) {
  const filtered = listingIsFiltered(sp);
  const page = pageParam(sp);
  return {
    title: page > 1 ? `${title} – trang ${page}` : title,
    description,
    alternates: { canonical: page > 1 && !filtered ? `${basePath}?page=${page}` : basePath },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}
