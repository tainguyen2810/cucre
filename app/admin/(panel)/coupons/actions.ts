"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { type FormState, fromLocalInput, money } from "@/lib/admin/form";
import { toSearchText } from "@/lib/slug";

const couponSchema = z.object({
  platformId: z.coerce.number().int().positive("Chọn sàn"),
  categoryId: z.coerce.number().int().positive().nullable(),
  code: z.string().trim().max(64, "Mã tối đa 64 ký tự").nullable(),
  title: z.string().trim().min(5, "Tiêu đề tối thiểu 5 ký tự").max(255),
  conditions: z.string().trim().nullable(),
  minOrder: z.number().int().min(0).nullable(),
  maxDiscount: z.number().int().min(0).nullable(),
  usedPercent: z.coerce.number().int().min(0, "0–100").max(100, "0–100"),
  url: z.url({ protocol: /^https?$/, error: "Link phải bắt đầu bằng http:// hoặc https://" }).max(1000),
  status: z.enum(["pending", "published", "expired"]),
  featured: z.boolean(),
  startsAt: z.date().nullable(),
  expiresAt: z.date().nullable(),
});

export async function saveCoupon(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(formData.get("id")) || null;
  const parsed = couponSchema.safeParse({
    platformId: formData.get("platformId"),
    categoryId: formData.get("categoryId") || null,
    code: String(formData.get("code") ?? "").trim().toUpperCase() || null,
    title: formData.get("title"),
    conditions: String(formData.get("conditions") ?? "").trim() || null,
    minOrder: money(formData.get("minOrder")),
    maxDiscount: money(formData.get("maxDiscount")),
    usedPercent: formData.get("usedPercent") || 0,
    url: String(formData.get("url") ?? "").trim(),
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
    startsAt: fromLocalInput(String(formData.get("startsAt") ?? "")),
    expiresAt: fromLocalInput(String(formData.get("expiresAt") ?? "")),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { errors, message: "Kiểm tra lại các ô báo đỏ." };
  }
  const data = { ...parsed.data, titleSearch: toSearchText(parsed.data.title) };

  let couponId = id;
  if (id) await db.coupon.update({ where: { id }, data });
  else couponId = (await db.coupon.create({ data })).id;

  revalidatePath("/", "layout");
  redirect(`/admin/coupons/${couponId}?ok=${id ? "saved" : "created"}`);
}

export async function duplicateCoupon(formData: FormData) {
  await requireAdmin();
  const src = await db.coupon.findUnique({ where: { id: Number(formData.get("id")) } });
  if (!src) redirect("/admin/coupons");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, createdAt, updatedAt, externalId, ...rest } = src;
  const copy = await db.coupon.create({ data: { ...rest, title: `${src.title} (bản sao)`.slice(0, 255), status: "pending", featured: false } });
  redirect(`/admin/coupons/${copy.id}?ok=copied`);
}

export async function deleteCoupon(formData: FormData) {
  await requireAdmin();
  await db.coupon.delete({ where: { id: Number(formData.get("id")) } }).catch(() => null);
  revalidatePath("/", "layout");
  redirect("/admin/coupons?ok=deleted");
}
