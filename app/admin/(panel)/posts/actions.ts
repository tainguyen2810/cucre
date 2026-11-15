"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { type FormState, fromLocalInput, lines } from "@/lib/admin/form";
import { uniqueSlug } from "@/lib/admin/slug";
import { toSearchText } from "@/lib/slug";

const postSchema = z.object({
  title: z.string().trim().min(5, "Tiêu đề tối thiểu 5 ký tự").max(255),
  slug: z.string().trim().max(150).optional(),
  category: z.string().trim().min(2, "Nhập chuyên mục").max(100),
  excerpt: z.string().trim().max(500, "Tối đa 500 ký tự").nullable(),
  content: z.string().trim().min(20, "Nội dung quá ngắn"),
  status: z.enum(["draft", "published"]),
  publishedAt: z.date().nullable(),
});

export async function savePost(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(formData.get("id")) || null;
  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    category: formData.get("category"),
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    content: formData.get("content"),
    status: formData.get("status"),
    publishedAt: fromLocalInput(String(formData.get("publishedAt") ?? "")),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { errors, message: "Kiểm tra lại các ô báo đỏ." };
  }
  const d = parsed.data;
  const existing = id ? await db.post.findUnique({ where: { id }, select: { slug: true } }) : null;
  const slug =
    existing && (!d.slug || d.slug === existing.slug)
      ? existing.slug
      : await uniqueSlug(d.slug || d.title, async (s) => Boolean(await db.post.findFirst({ where: { slug: s, ...(id ? { id: { not: id } } : {}) }, select: { id: true } })));

  let cover: string | null = null;
  try {
    const imgs = JSON.parse(String(formData.get("coverImage") ?? "[]"));
    cover = Array.isArray(imgs) && typeof imgs[0] === "string" && imgs[0].startsWith("/uploads/") ? imgs[0] : null;
  } catch {}

  const relatedSlugs = lines(formData.get("relatedDeals")).map((l) => l.replace(/^.*\/deal\//, "").trim());
  const related = relatedSlugs.length ? await db.deal.findMany({ where: { slug: { in: relatedSlugs } }, select: { id: true } }) : [];

  const data = {
    title: d.title,
    slug,
    titleSearch: toSearchText(d.title),
    category: d.category,
    excerpt: d.excerpt,
    content: d.content,
    coverImage: cover,
    status: d.status,
    publishedAt: d.status === "published" ? (d.publishedAt ?? new Date()) : d.publishedAt,
  };
  let postId = id;
  if (id) await db.post.update({ where: { id }, data: { ...data, relatedDeals: { set: related } } });
  else postId = (await db.post.create({ data: { ...data, relatedDeals: { connect: related } } })).id;

  revalidatePath("/", "layout");
  redirect(`/admin/posts/${postId}?ok=${id ? "saved" : "created"}`);
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  await db.post.delete({ where: { id: Number(formData.get("id")) } }).catch(() => null);
  revalidatePath("/", "layout");
  redirect("/admin/posts?ok=deleted");
}
