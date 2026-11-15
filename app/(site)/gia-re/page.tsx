import type { Metadata } from "next";
import { AutoSubmitSelect } from "@/components/AutoSubmitSelect";
import { DealCard } from "@/components/DealCard";
import { Button } from "@/components/ui/Button";
import { ChipLink } from "@/components/ui/Chip";
import { Pagination } from "@/components/ui/Pagination";
import { PRICE_TABS, SORTS, listDeals, listingFilterOptions } from "@/lib/queries/listing";
import { hrefWith, pageParam, param } from "@/lib/url";

const BASE = "/gia-re";

function readFilters(sp: Record<string, string | string[] | undefined>) {
  return {
    gia: param(sp, "gia"),
    "danh-muc": param(sp, "danh-muc"),
    san: param(sp, "san"),
    "sap-xep": param(sp, "sap-xep"),
  };
}

export async function generateMetadata({ searchParams }: PageProps<"/gia-re">): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Object.values(readFilters(sp)).some(Boolean);
  const page = pageParam(sp);
  return {
    title: page > 1 ? `Deal đồ công nghệ giá rẻ – trang ${page}` : "Deal đồ công nghệ giá rẻ hôm nay",
    description: "Deal SSD, chuột, bàn phím, tai nghe, phụ kiện giá rẻ trên Shopee, Lazada, TikTok Shop – có nhận xét của kỹ thuật viên.",
    alternates: { canonical: page > 1 && !filtered ? `${BASE}?page=${page}` : BASE },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function CheapDealsPage({ searchParams }: PageProps<"/gia-re">) {
  const sp = await searchParams;
  const current = readFilters(sp);
  const page = pageParam(sp);

  const [{ deals, total, totalPages }, { categories, platforms }] = await Promise.all([
    listDeals("product", { gia: current.gia, danhMuc: current["danh-muc"], san: current.san, sapXep: current["sap-xep"], page }),
    listingFilterOptions("product"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl leading-tight font-extrabold md:text-page">Deal công nghệ giá rẻ</h1>
        <p className="max-w-2xl text-muted">Đồ công nghệ và phụ kiện đang giảm giá, mỗi deal đều có nhận xét của kỹ thuật viên.</p>
      </header>

      <nav aria-label="Mức giá" className="-mx-4 md:mx-0">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 md:flex-wrap md:px-0">
          {PRICE_TABS.map((t) => (
            <ChipLink key={t.label} href={hrefWith(BASE, current, { gia: t.value })} active={current.gia === t.value}>
              {t.label}
            </ChipLink>
          ))}
        </div>
      </nav>

      <form action={BASE} className="flex flex-wrap items-end gap-3" aria-label="Lọc và sắp xếp">
        {current.gia ? <input type="hidden" name="gia" value={current.gia} /> : null}
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
        <div className="flex flex-col gap-1">
          <label htmlFor="loc-san" className="text-xs font-semibold text-muted">
            Sàn
          </label>
          <AutoSubmitSelect id="loc-san" name="san" defaultValue={current.san ?? ""}>
            <option value="">Tất cả sàn</option>
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
        <p className="rounded-xl border border-line bg-surface p-6 text-center text-muted">
          Không có deal phù hợp bộ lọc. Thử chọn mức giá hoặc danh mục khác.
        </p>
      )}

      <Pagination page={page} totalPages={totalPages} basePath={BASE} searchParams={current} />
    </div>
  );
}
