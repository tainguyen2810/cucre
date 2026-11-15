import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { deletePost } from "@/app/admin/(panel)/posts/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { StatusPill } from "@/components/admin/fields";
import { Flash } from "@/components/admin/Flash";
import { PostForm } from "@/components/admin/PostForm";
import { requireAdmin } from "@/lib/admin/auth";
import { toLocalInput } from "@/lib/admin/form";
import { postCategoryNames } from "@/lib/admin/posts";
import { db } from "@/lib/db";
import { param } from "@/lib/url";

export const metadata: Metadata = { title: "Sửa bài" };

export default async function EditPostPage({ params, searchParams }: PageProps<"/admin/posts/[id]">) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const post = await db.post.findUnique({ where: { id: Number(id) || 0 }, include: { relatedDeals: { select: { slug: true } } } });
  if (!post) notFound();
  const categories = await postCategoryNames();
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link href="/admin/posts" className="text-sm text-muted hover:text-brand">← Danh sách bài</Link>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold">Sửa bài <StatusPill status={post.status} /></h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/blog/${post.slug}`} target="_blank" className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-line-strong bg-surface px-3 text-sm font-bold hover:bg-canvas">
            Xem bài <ExternalLink className="size-3.5" aria-hidden />
          </Link>
          <form action={deletePost}>
            <input type="hidden" name="id" value={post.id} />
            <ConfirmButton />
          </form>
        </div>
      </div>
      <Flash ok={param(sp, "ok")} />
      <PostForm
        key={post.updatedAt.toISOString()}
        categories={categories}
        values={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          category: post.category,
          excerpt: post.excerpt ?? "",
          content: post.content,
          coverImage: post.coverImage,
          relatedDeals: post.relatedDeals.map((d) => d.slug).join("\n"),
          status: post.status,
          publishedAt: toLocalInput(post.publishedAt),
        }}
      />
    </div>
  );
}
