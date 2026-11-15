import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DealCard } from "@/components/DealCard";
import { JsonLd } from "@/components/JsonLd";
import { formatLongDate } from "@/components/PostCard";
import { ImageBox } from "@/components/ui/ImageBox";
import { db } from "@/lib/db";
import { embeddedDealSlugs, readingMinutes, renderArticle } from "@/lib/markdown";
import { dealCardSelect } from "@/lib/queries/deals";
import { getPostBySlug } from "@/lib/queries/posts";
import { SITE, SITE_URL } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt ?? undefined, url: `/blog/${post.slug}`, publishedTime: post.publishedAt?.toISOString(), images: post.coverImage ? [post.coverImage] : undefined },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const { blocks, toc } = renderArticle(post.content);
  const embedded = embeddedDealSlugs(post.content);
  const deals = await db.deal.findMany({
    where: { OR: [{ slug: { in: embedded } }, { id: { in: post.relatedDeals.map((d) => d.id) } }], status: { in: ["published", "expired"] } },
    select: dealCardSelect,
  });
  const bySlug = new Map(deals.map((d) => [d.slug, d]));
  const related = deals.filter((d) => post.relatedDeals.some((r) => r.id === d.id) && !embedded.includes(d.slug));

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} siteUrl={SITE_URL} />
      <article className="flex flex-col gap-6">
        <header className="flex max-w-3xl flex-col gap-3">
          <p className="text-sm font-bold uppercase tracking-wide text-brand">{post.category}</p>
          <h1 className="text-[28px] leading-tight font-extrabold md:text-page">{post.title}</h1>
          {post.excerpt ? <p className="text-lg text-muted">{post.excerpt}</p> : null}
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-subtle">
            <time dateTime={post.publishedAt?.toISOString()}>{formatLongDate(post.publishedAt)}</time>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden /> {readingMinutes(post.content)} phút đọc
            </span>
          </p>
        </header>
        {post.coverImage ? <ImageBox src={post.coverImage} alt={post.title} className="aspect-[16/9] max-w-4xl rounded-xl border border-line" sizes="(max-width: 900px) 100vw, 900px" /> : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="flex min-w-0 flex-col gap-6">
            {toc.length >= 2 ? (
              <details className="rounded-xl border border-line bg-surface p-4 lg:hidden" open>
                <summary className="cursor-pointer font-bold">Mục lục</summary>
                <TocList toc={toc} />
              </details>
            ) : null}
            {blocks.map((b, i) =>
              b.kind === "html" ? (
                <div key={i} className="article" dangerouslySetInnerHTML={{ __html: b.html }} />
              ) : bySlug.get(b.slug) ? (
                <div key={i} className="max-w-[300px]">
                  <DealCard deal={bySlug.get(b.slug)!} />
                </div>
              ) : null,
            )}
            <p className="max-w-[68ch] rounded-lg bg-canvas px-4 py-3 text-sm text-muted">{SITE.disclosure}</p>
          </div>
          {toc.length >= 2 ? (
            <aside className="hidden lg:block">
              <nav aria-label="Mục lục" className="sticky top-4 rounded-xl border border-line bg-surface p-4">
                <p className="font-bold">Mục lục</p>
                <TocList toc={toc} />
              </nav>
            </aside>
          ) : null}
        </div>
      </article>

      {related.length > 0 ? (
        <section className="flex flex-col gap-4" aria-labelledby="deal-lien-quan">
          <h2 id="deal-lien-quan" className="text-section font-extrabold">Deal liên quan</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {related.map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        </section>
      ) : null}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt ?? undefined,
          image: post.coverImage ? [new URL(post.coverImage, SITE_URL).toString()] : undefined,
          datePublished: post.publishedAt?.toISOString(),
          dateModified: post.updatedAt.toISOString(),
          inLanguage: "vi-VN",
          mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
          author: { "@type": "Organization", name: "Kỹ thuật viên cucre.vn" },
          publisher: { "@type": "Organization", name: SITE.name, url: SITE_URL },
        }}
      />
    </div>
  );
}

function TocList({ toc }: { toc: { id: string; text: string; depth: 2 | 3 }[] }) {
  return (
    <ol className="mt-2 flex flex-col gap-1 text-sm">
      {toc.map((t) => (
        <li key={t.id} className={t.depth === 3 ? "pl-4" : undefined}>
          <a href={`#${t.id}`} className="inline-flex min-h-8 items-center text-muted hover:text-brand" dangerouslySetInnerHTML={{ __html: t.text }} />
        </li>
      ))}
    </ol>
  );
}
