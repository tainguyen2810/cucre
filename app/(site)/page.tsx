import type { Metadata } from "next";
import { CouponTicket } from "@/components/CouponTicket";
import { DealCard } from "@/components/DealCard";
import { JsonLd } from "@/components/JsonLd";
import { PostCard } from "@/components/PostCard";
import { SectionHeader } from "@/components/SectionHeader";
import { db } from "@/lib/db";
import { getCoupons } from "@/lib/queries/coupons";
import { activeDealWhere, dealCardSelect } from "@/lib/queries/deals";
import { postCardSelect, publishedPostWhere } from "@/lib/queries/posts";
import { SITE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const grid = "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4";

export default async function HomePage() {
  const [featured, coupons, latest, digital, travel, posts] = await Promise.all([
    db.deal.findMany({ where: { ...activeDealWhere(), featured: true }, select: dealCardSelect, orderBy: { publishedAt: "desc" }, take: 8 }),
    getCoupons({ take: 4 }),
    db.deal.findMany({ where: { ...activeDealWhere(), featured: false, type: "product" }, select: dealCardSelect, orderBy: { publishedAt: "desc" }, take: 8 }),
    db.deal.findMany({ where: { ...activeDealWhere(), type: "digital" }, select: dealCardSelect, orderBy: [{ featured: "desc" }, { publishedAt: "desc" }], take: 4 }),
    db.deal.findMany({ where: { ...activeDealWhere(), type: "travel" }, select: dealCardSelect, orderBy: [{ featured: "desc" }, { publishedAt: "desc" }], take: 4 }),
    db.post.findMany({ where: publishedPostWhere(), select: postCardSelect, orderBy: { publishedAt: "desc" }, take: 3 }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-2 pt-2">
        <h1 className="text-[32px] leading-tight font-extrabold tracking-tight md:text-hero">Săn deal cực rẻ</h1>
        <p className="max-w-2xl text-muted">
          Kỹ thuật viên soi trước – hàng dỏm không lên. Mã giảm giá Shopee, Lazada, TikTok Shop, đồ công nghệ, phần mềm bản quyền và du lịch giá tốt mỗi ngày.
        </p>
      </section>

      {featured.length > 0 ? (
        <section className="flex flex-col gap-4" aria-labelledby="hot-deal">
          <SectionHeader id="hot-deal" title="Hot deal hôm nay" href="/gia-re" />
          <div className={grid}>
            {featured.map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        </section>
      ) : null}

      {coupons.length > 0 ? (
        <section className="flex flex-col gap-4" aria-labelledby="ma-hot">
          <SectionHeader id="ma-hot" title="Mã giảm giá hot" href="/ma-giam-gia" />
          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            {coupons.map((c) => (
              <CouponTicket key={c.id} coupon={c} />
            ))}
          </div>
        </section>
      ) : null}

      {latest.length > 0 ? (
        <section className="flex flex-col gap-4" aria-labelledby="deal-moi">
          <SectionHeader id="deal-moi" title="Đồ công nghệ giá rẻ" href="/gia-re" />
          <div className={grid}>
            {latest.map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        </section>
      ) : null}

      {[
        { id: "ky-thuat-so", title: "Phần mềm bản quyền", href: "/ky-thuat-so", items: digital },
        { id: "du-lich", title: "Du lịch giá tốt", href: "/du-lich", items: travel },
      ].map((sec) =>
        sec.items.length > 0 ? (
          <section key={sec.id} className="flex flex-col gap-4" aria-labelledby={`home-${sec.id}`}>
            <SectionHeader id={`home-${sec.id}`} title={sec.title} href={sec.href} />
            <div className={grid}>
              {sec.items.map((d) => (
                <DealCard key={d.id} deal={d} />
              ))}
            </div>
          </section>
        ) : null,
      )}

      {posts.length > 0 ? (
        <section className="flex flex-col gap-4" aria-labelledby="home-blog">
          <SectionHeader id="home-blog" title="Nên mua gì" href="/blog" linkLabel="Xem bài viết" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      ) : null}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE.name,
          url: SITE_URL,
          inLanguage: "vi-VN",
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/tim-kiem?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
    </div>
  );
}
