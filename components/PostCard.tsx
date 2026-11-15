import Link from "next/link";
import { ImageBox } from "@/components/ui/ImageBox";

export type PostCardData = { title: string; slug: string; category: string; excerpt: string | null; coverImage: string | null; publishedAt: Date | null };

export const formatLongDate = (d: Date | null) =>
  d ? new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(d) : "";

export function PostCard({ post }: { post: PostCardData }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
      <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden>
        <ImageBox src={post.coverImage} alt="" className="aspect-[16/9]" sizes="(max-width: 768px) 100vw, 380px" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">{post.category}</p>
        <h3 className="line-clamp-2 text-lg leading-snug font-bold">
          <Link href={`/blog/${post.slug}`} className="hover:text-brand">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? <p className="line-clamp-3 text-sm text-muted">{post.excerpt}</p> : null}
        <p className="mt-auto pt-1 text-xs text-subtle">{formatLongDate(post.publishedAt)}</p>
      </div>
    </article>
  );
}
