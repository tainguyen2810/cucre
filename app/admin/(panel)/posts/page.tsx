import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { StatusPill } from "@/components/admin/fields";
import { Flash } from "@/components/admin/Flash";
import { formatLongDate } from "@/components/PostCard";
import { LinkButton } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { param } from "@/lib/url";

export const metadata: Metadata = { title: "Bài viết" };

export default async function AdminPostsPage({ searchParams }: PageProps<"/admin/posts">) {
  await requireAdmin();
  const ok = param(await searchParams, "ok");
  const posts = await db.post.findMany({ orderBy: { updatedAt: "desc" }, take: 200, select: { id: true, title: true, category: true, status: true, publishedAt: true } });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Bài viết <span className="text-base font-semibold text-muted">({posts.length})</span></h1>
        <LinkButton href="/admin/posts/new"><Plus className="size-4" aria-hidden /> Viết bài</LinkButton>
      </div>
      <Flash ok={ok} />
      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {posts.map((p) => {
          const scheduled = p.status === "published" && p.publishedAt && p.publishedAt > new Date();
          return (
            <li key={p.id} className="flex flex-col gap-1 p-3">
              <Link href={`/admin/posts/${p.id}`} className="font-semibold hover:text-brand">{p.title}</Link>
              <p className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
                {scheduled ? <span className="rounded-sm bg-info-bg px-2 py-0.5 text-xs font-bold text-info">Hẹn giờ</span> : <StatusPill status={p.status} />}
                <span>{p.category}</span>
                {p.publishedAt ? <span>{formatLongDate(p.publishedAt)}</span> : null}
              </p>
            </li>
          );
        })}
        {posts.length === 0 ? <li className="p-6 text-center text-muted">Chưa có bài viết.</li> : null}
      </ul>
    </div>
  );
}
