import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

export const BLOG_PAGE_SIZE = 12;

export function publishedPostWhere(): Prisma.PostWhereInput {
  return { status: "published", publishedAt: { lte: new Date() } };
}

export const postCardSelect = {
  id: true,
  title: true,
  slug: true,
  category: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
} satisfies Prisma.PostSelect;

export async function listPosts(opts: { category?: string; page: number }) {
  const where: Prisma.PostWhereInput = { ...publishedPostWhere(), ...(opts.category ? { category: opts.category } : {}) };
  const [total, posts] = await Promise.all([
    db.post.count({ where }),
    db.post.findMany({ where, select: postCardSelect, orderBy: { publishedAt: "desc" }, skip: (opts.page - 1) * BLOG_PAGE_SIZE, take: BLOG_PAGE_SIZE }),
  ]);
  return { total, posts, totalPages: Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE)) };
}

export async function postCategories() {
  const rows = await db.post.groupBy({ by: ["category"], where: publishedPostWhere(), _count: { _all: true }, orderBy: { category: "asc" } });
  return rows.map((r) => ({ name: r.category, count: r._count._all }));
}

export const getPostBySlug = cache(async (slug: string) => {
  const post = await db.post.findUnique({ where: { slug }, include: { relatedDeals: { select: { id: true } } } });
  if (!post || post.status !== "published" || !post.publishedAt || post.publishedAt > new Date()) return null;
  return post;
});
