import type { Metadata } from "next";
import { PostCard } from "@/components/PostCard";
import { ChipLink } from "@/components/ui/Chip";
import { Pagination } from "@/components/ui/Pagination";
import { listPosts, postCategories } from "@/lib/queries/posts";
import { hrefWith, pageParam, param } from "@/lib/url";

export async function generateMetadata({ searchParams }: PageProps<"/blog">): Promise<Metadata> {
  const sp = await searchParams;
  const page = pageParam(sp);
  return {
    title: page > 1 ? `Blog Nên mua gì – trang ${page}` : "Blog Nên mua gì – tư vấn chọn đồ công nghệ, kinh nghiệm săn deal",
    description: "Kỹ thuật viên tư vấn nên mua SSD, laptop, phụ kiện nào; mẹo săn mã giảm giá và kinh nghiệm du lịch tiết kiệm.",
    alternates: { canonical: page > 1 && !param(sp, "chuyen-muc") ? `/blog?page=${page}` : "/blog" },
    robots: param(sp, "chuyen-muc") ? { index: false, follow: true } : undefined,
  };
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const sp = await searchParams;
  const category = param(sp, "chuyen-muc");
  const page = pageParam(sp);
  const [{ posts, totalPages }, categories] = await Promise.all([listPosts({ category, page }), postCategories()]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl leading-tight font-extrabold md:text-page">Nên mua gì</h1>
        <p className="max-w-2xl text-muted">Kỹ thuật viên viết, không nhận tiền quảng cáo để khen. Tư vấn chọn đồ, mẹo săn deal, kinh nghiệm du lịch.</p>
      </header>
      {categories.length > 1 ? (
        <nav aria-label="Chuyên mục" className="-mx-4 md:mx-0">
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 md:flex-wrap md:px-0">
            <ChipLink href="/blog" active={!category}>Tất cả</ChipLink>
            {categories.map((c) => (
              <ChipLink key={c.name} href={hrefWith("/blog", {}, { "chuyen-muc": c.name })} active={c.name === category}>
                {c.name}
              </ChipLink>
            ))}
          </div>
        </nav>
      ) : null}
      {posts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-line bg-surface p-6 text-center text-muted">Chưa có bài viết.</p>
      )}
      <Pagination page={page} totalPages={totalPages} basePath="/blog" searchParams={{ "chuyen-muc": category }} />
    </div>
  );
}
