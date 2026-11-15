"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { type FormState, fromLocalInput, lines, money } from "@/lib/admin/form";
import { uniqueSlug } from "@/lib/admin/slug";
import { discountPercent } from "@/lib/format";
import { toSearchText } from "@/lib/slug";

const dealSchema = z.object({
  type: z.enum(["product", "digital", "travel", "local"]),
  title: z.string().trim().min(5, "Tiêu đề tối thiểu 5 ký tự").max(255, "Tiêu đề tối đa 255 ký tự"),
  slug: z.string().trim().max(150).optional(),
  platformId: z.coerce.number().int().positive("Chọn sàn"),
  categoryId: z.coerce.number().int().positive().nullable(),
  price: z.number({ error: "Nhập giá bán" }).int().min(0),
  oldPrice: z.number().int().positive().nullable(),
  affiliateUrl: z.url({ protocol: /^https?$/, error: "Link phải bắt đầu bằng http:// hoặc https://" }).max(1000),
  summary: z.string().trim().max(500, "Tối đa 500 ký tự").optional(),
  description: z.string().trim().optional(),
  destination: z.string().trim().max(120).optional(),
  techVerdict: z.string().trim().optional(),
  status: z.enum(["draft", "pending", "published", "expired"]),
  featured: z.boolean(),
  expiresAt: z.date().nullable(),
});

function parseImages(raw: FormDataEntryValue | null): string[] {
  try {
    const v = JSON.parse(String(raw ?? "[]"));
    return Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.startsWith("/uploads/")).slice(0, 10) : [];
  } catch {
    return [];
  }
}

export async function saveDeal(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(formData.get("id")) || null;

  const parsed = dealSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    platformId: formData.get("platformId"),
    categoryId: formData.get("categoryId") ? formData.get("categoryId") : null,
    price: money(formData.get("price")) ?? undefined,
    oldPrice: money(formData.get("oldPrice")),
    affiliateUrl: String(formData.get("affiliateUrl") ?? "").trim(),
    summary: formData.get("summary") || undefined,
    description: formData.get("description") || undefined,
    destination: formData.get("destination") || undefined,
    techVerdict: formData.get("techVerdict") || undefined,
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
    expiresAt: fromLocalInput(String(formData.get("expiresAt") ?? "")),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { errors, message: "Kiểm tra lại các ô báo đỏ." };
  }
  const d = parsed.data;
  if (d.oldPrice !== null && d.oldPrice <= d.price) {
    return { errors: { oldPrice: "Giá gốc phải lớn hơn giá bán (hoặc để trống)" }, message: "Kiểm tra lại các ô báo đỏ." };
  }

  const existing = id ? await db.deal.findUnique({ where: { id }, select: { slug: true, price: true, publishedAt: true } }) : null;
  if (id && !existing) return { message: "Deal không còn tồn tại." };

  const wantedSlug = d.slug || d.title;
  const slug =
    existing && (!d.slug || d.slug === existing.slug)
      ? existing.slug
      : await uniqueSlug(wantedSlug, async (s) => Boolean(await db.deal.findFirst({ where: { slug: s, ...(id ? { id: { not: id } } : {}) }, select: { id: true } })));

  const couponIds = formData.getAll("couponIds").map(Number).filter(Boolean);
  const data = {
    type: d.type,
    title: d.title,
    slug,
    titleSearch: toSearchText(d.title),
    summary: d.summary ?? null,
    description: d.description ?? null,
    images: parseImages(formData.get("images")),
    price: d.price,
    oldPrice: d.oldPrice,
    discountPercent: discountPercent(d.price, d.oldPrice),
    affiliateUrl: d.affiliateUrl,
    destination: d.type === "travel" ? (d.destination ?? null) : null,
    techPros: lines(formData.get("techPros")),
    techCons: lines(formData.get("techCons")),
    techVerdict: d.techVerdict ?? null,
    status: d.status,
    featured: d.featured,
    expiresAt: d.expiresAt,
    publishedAt: d.status === "published" && !existing?.publishedAt ? new Date() : (existing?.publishedAt ?? null),
    platformId: d.platformId,
    categoryId: d.categoryId,
  };

  let dealId: number;
  if (id && existing) {
    await db.deal.update({ where: { id }, data: { ...data, coupons: { set: couponIds.map((c) => ({ id: c })) } } });
    dealId = id;
    // Ghi lịch sử giá khi giá thay đổi
    if (existing.price !== d.price) await db.priceHistory.create({ data: { dealId, price: d.price } });
  } else {
    const created = await db.deal.create({ data: { ...data, coupons: { connect: couponIds.map((c) => ({ id: c })) } } });
    dealId = created.id;
    await db.priceHistory.create({ data: { dealId, price: d.price } });
  }

  revalidatePath("/", "layout");
  redirect(`/admin/deals/${dealId}?ok=${id ? "saved" : "created"}`);
}

export async function duplicateDeal(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const src = await db.deal.findUnique({ where: { id }, include: { coupons: { select: { id: true } } } });
  if (!src) redirect("/admin/deals");
  const title = `${src.title} (bản sao)`.slice(0, 255);
  const slug = await uniqueSlug(title, async (s) => Boolean(await db.deal.findUnique({ where: { slug: s }, select: { id: true } })));
  const copy = await db.deal.create({
    data: {
      type: src.type,
      title,
      slug,
      titleSearch: toSearchText(title),
      summary: src.summary,
      description: src.description,
      images: src.images ?? [],
      price: src.price,
      oldPrice: src.oldPrice,
      discountPercent: src.discountPercent,
      affiliateUrl: src.affiliateUrl,
      destination: src.destination,
      techPros: src.techPros ?? [],
      techCons: src.techCons ?? [],
      techVerdict: src.techVerdict,
      status: "draft",
      featured: false,
      expiresAt: src.expiresAt,
      platformId: src.platformId,
      categoryId: src.categoryId,
      coupons: { connect: src.coupons },
    },
  });
  redirect(`/admin/deals/${copy.id}?ok=copied`);
}

export async function deleteDeal(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.deal.delete({ where: { id } }).catch(() => null);
  revalidatePath("/", "layout");
  redirect("/admin/deals?ok=deleted");
}

export async function toggleDealFeatured(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const deal = await db.deal.findUnique({ where: { id }, select: { featured: true } });
  if (deal) await db.deal.update({ where: { id }, data: { featured: !deal.featured } });
  revalidatePath("/admin/deals");
  revalidatePath("/");
}
