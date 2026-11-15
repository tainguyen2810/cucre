import type { Metadata } from "next";
import { CouponTicket } from "@/components/CouponTicket";
import { DealCard } from "@/components/DealCard";
import { SearchBox } from "@/components/SearchBox";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { activeCouponWhere, couponTicketInclude } from "@/lib/queries/coupons";
import { activeDealWhere, dealCardSelect } from "@/lib/queries/deals";
import { toSearchText } from "@/lib/slug";
import { param } from "@/lib/url";

export async function generateMetadata({ searchParams }: PageProps<"/tim-kiem">): Promise<Metadata> {
  const q = param(await searchParams, "q");
  return { title: q ? `Kết quả tìm “${q}”` : "Tìm kiếm", robots: { index: false, follow: true } };
}

/** Tách từ khóa không dấu; mọi từ đều phải có trong tiêu đề */
function terms(q: string) {
  return toSearchText(q)
    .split(" ")
    .filter((t) => t.length >= 2)
    .slice(0, 6);
}

export default async function SearchPage({ searchParams }: PageProps<"/tim-kiem">) {
  const q = param(await searchParams, "q")?.slice(0, 100);
  const words = q ? terms(q) : [];

  const [deals, coupons] =
    words.length > 0
      ? await Promise.all([
          db.deal.findMany({
            where: { AND: [activeDealWhere(), ...words.map((w): Prisma.DealWhereInput => ({ OR: [{ titleSearch: { contains: w } }, { platform: { slug: { contains: w } } }] }))] },
            select: dealCardSelect,
            orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
            take: 24,
          }),
          db.coupon.findMany({
            where: {
              AND: [
                activeCouponWhere(),
                ...words.map((w): Prisma.CouponWhereInput => ({ OR: [{ titleSearch: { contains: w } }, { platform: { slug: { contains: w } } }] })),
              ],
            },
            include: couponTicketInclude,
            orderBy: { expiresAt: "asc" },
            take: 12,
          }),
        ])
      : [[], []];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl leading-tight font-extrabold md:text-page">{q ? `Kết quả cho “${q}”` : "Tìm deal, mã giảm giá"}</h1>
        <SearchBox className="max-w-xl" defaultValue={q} id="search-page" />
        {q ? (
          <p className="text-muted" aria-live="polite">
            {deals.length + coupons.length > 0 ? `Tìm thấy ${deals.length} deal và ${coupons.length} mã giảm giá.` : "Không tìm thấy kết quả. Thử từ khóa ngắn hơn, ví dụ “ssd”, “tai nghe”, “shopee”."}
          </p>
        ) : null}
      </header>

      {coupons.length > 0 ? (
        <section className="flex flex-col gap-3" aria-labelledby="kq-ma">
          <h2 id="kq-ma" className="text-xl font-extrabold">
            Mã giảm giá
          </h2>
          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            {coupons.map((c) => (
              <CouponTicket key={c.id} coupon={c} />
            ))}
          </div>
        </section>
      ) : null}

      {deals.length > 0 ? (
        <section className="flex flex-col gap-3" aria-labelledby="kq-deal">
          <h2 id="kq-deal" className="text-xl font-extrabold">
            Deal
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {deals.map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
