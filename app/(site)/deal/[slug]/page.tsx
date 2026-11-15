import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock, CircleAlert, CircleCheck } from "lucide-react";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { CouponTicket } from "@/components/CouponTicket";
import { DealCard, isExpired } from "@/components/DealCard";
import { JsonLd } from "@/components/JsonLd";
import { PriceChart } from "@/components/PriceChart";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { ImageBox, firstImage } from "@/components/ui/ImageBox";
import { Price } from "@/components/ui/Price";
import { formatShortDate } from "@/lib/format";
import { SEGMENT_PAGE, SPONSORED_LINK, dealPath, goDeal } from "@/lib/links";
import { getDealBySlug, getSimilarDeals } from "@/lib/queries/deals";
import { SITE, SITE_URL } from "@/lib/site";

const asStrings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

export async function generateMetadata({ params }: PageProps<"/deal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const deal = await getDealBySlug(slug);
  if (!deal) return {};
  const description =
    deal.summary ?? deal.techVerdict ?? `${deal.title} giá ${deal.price.toLocaleString("vi-VN")}đ trên ${deal.platform.name}.`;
  const image = firstImage(deal.images);
  return {
    title: deal.discountPercent > 0 ? `${deal.title} – giảm ${deal.discountPercent}%` : deal.title,
    description,
    alternates: { canonical: dealPath(deal.slug) },
    openGraph: { title: deal.title, description, url: dealPath(deal.slug), type: "website", images: image ? [image] : undefined },
  };
}

export default async function DealPage({ params }: PageProps<"/deal/[slug]">) {
  const { slug } = await params;
  const deal = await getDealBySlug(slug);
  if (!deal) notFound();

  const expired = isExpired(deal);
  const similar = await getSimilarDeals(deal);
  const images = asStrings(deal.images);
  const pros = asStrings(deal.techPros);
  const cons = asStrings(deal.techCons);
  const hasReview = pros.length > 0 || cons.length > 0 || Boolean(deal.techVerdict);
  const segment = SEGMENT_PAGE[deal.type];

  const crumbs: Crumb[] = [
    { label: segment.label, href: segment.href },
    ...(deal.category ? [{ label: deal.category.name, href: `${segment.href}?danh-muc=${deal.category.slug}` }] : []),
    { label: deal.title },
  ];

  const similarSection = similar.length > 0 && (
    <section className="flex flex-col gap-4" aria-labelledby="deal-tuong-tu">
      <h2 id="deal-tuong-tu" className="text-section font-extrabold">
        Deal tương tự
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {similar.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>
    </section>
  );

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs items={crumbs} siteUrl={SITE_URL} />

      {expired ? (
        <div role="status" className="flex items-start gap-2 rounded-xl border border-line-strong bg-surface p-4">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          <p>
            <b>Deal này đã hết hạn.</b> Giá có thể đã thay đổi. Xem các deal tương tự đang còn bên dưới.
          </p>
        </div>
      ) : null}
      {expired ? similarSection : null}

      <article className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-8">
        <div className="flex min-w-0 flex-col gap-3">
          <ImageBox
            src={images[0] ?? null}
            alt={deal.title}
            className={`rounded-xl border border-line ${expired ? "opacity-60" : ""}`}
            sizes="(max-width: 768px) 100vw, 520px"
          />
          {images.length > 1 ? (
            <ul className="no-scrollbar flex gap-2 overflow-x-auto">
              {images.slice(1, 6).map((src) => (
                <li key={src} className="w-20 shrink-0">
                  <ImageBox src={src} alt="" className="rounded-md border border-line" sizes="80px" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="platform">{deal.platform.name}</Badge>
            {deal.discountPercent > 0 && !expired ? <Badge tone="discount">-{deal.discountPercent}%</Badge> : null}
            {hasReview ? <Badge tone="verified">KTV đã kiểm tra</Badge> : null}
            {expired ? <Badge tone="expired">Đã hết hạn</Badge> : null}
          </div>
          <h1 className="text-2xl leading-tight font-extrabold md:text-page">{deal.title}</h1>
          {deal.summary ? <p className="text-muted">{deal.summary}</p> : null}
          <Price price={deal.price} oldPrice={deal.oldPrice} size="lg" />
          {deal.expiresAt ? (
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <CalendarClock className="size-4" aria-hidden />
              {expired ? "Đã hết hạn ngày" : "Ưu đãi đến hết ngày"} {formatShortDate(deal.expiresAt)}
            </p>
          ) : null}

          {expired ? null : (
            <div className="flex flex-col gap-2">
              <a href={goDeal(deal.id)} {...SPONSORED_LINK} className={buttonClass("primary", "md", "min-h-12 w-full text-base md:max-w-sm")}>
                Lấy deal trên {deal.platform.name}
              </a>
              <p className="text-xs text-muted">{SITE.disclosure}</p>
            </div>
          )}

          {deal.coupons.length > 0 && !expired ? (
            <section className="flex flex-col gap-3" aria-labelledby="ma-dung-kem">
              <h2 id="ma-dung-kem" className="text-lg font-extrabold">
                Mã dùng kèm
              </h2>
              {deal.coupons.map((c) => (
                <CouponTicket key={c.id} coupon={c} />
              ))}
            </section>
          ) : null}
        </div>
      </article>

      {hasReview ? (
        <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 md:p-5" aria-labelledby="danh-gia-ktv">
          <h2 id="danh-gia-ktv" className="text-section font-extrabold">
            Đánh giá của kỹ thuật viên
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pros.length > 0 ? (
              <div className="rounded-lg bg-ok-bg p-4 text-ok">
                <h3 className="mb-2 font-bold">Điểm cộng</h3>
                <ul className="flex flex-col gap-1.5">
                  {pros.map((p) => (
                    <li key={p} className="flex gap-2">
                      <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {cons.length > 0 ? (
              <div className="rounded-lg bg-warn-bg p-4 text-warn">
                <h3 className="mb-2 font-bold">Lưu ý</h3>
                <ul className="flex flex-col gap-1.5">
                  {cons.map((c) => (
                    <li key={c} className="flex gap-2">
                      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          {deal.techVerdict ? (
            <p>
              <b>Kết luận:</b> {deal.techVerdict}
            </p>
          ) : null}
        </section>
      ) : null}

      {deal.description ? (
        <section className="flex flex-col gap-3" aria-labelledby="mo-ta">
          <h2 id="mo-ta" className="text-section font-extrabold">
            Mô tả
          </h2>
          <div className="flex max-w-3xl flex-col gap-3">
            {deal.description.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <PriceChart points={deal.priceHistory} currentPrice={deal.price} />

      {expired ? null : similarSection}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: deal.title,
          description: deal.summary ?? deal.techVerdict ?? undefined,
          image: images.length > 0 ? images.map((src) => new URL(src, SITE_URL).toString()) : undefined,
          category: deal.category?.name,
          offers: {
            "@type": "Offer",
            url: new URL(dealPath(deal.slug), SITE_URL).toString(),
            priceCurrency: "VND",
            price: deal.price,
            availability: expired ? "https://schema.org/Discontinued" : "https://schema.org/InStock",
            ...(deal.expiresAt ? { priceValidUntil: deal.expiresAt.toISOString().slice(0, 10) } : {}),
            seller: { "@type": "Organization", name: deal.platform.name },
          },
        }}
      />
    </div>
  );
}
