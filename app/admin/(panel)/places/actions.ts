"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { type FormState, fromLocalInput, money } from "@/lib/admin/form";
import { uniqueSlug } from "@/lib/admin/slug";
import { slugify, toSearchText } from "@/lib/slug";

const optionalNumber = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim().replace(",", ".");
  return s ? Number(s) : null;
};

const placeSchema = z.object({
  name: z.string().trim().min(2, "Nhập tên quán").max(191),
  slug: z.string().trim().max(150).optional(),
  type: z.enum(["restaurant", "cafe", "buffet", "spa", "massage", "salon", "other"]),
  address: z.string().trim().min(3, "Nhập địa chỉ").max(255),
  district: z.string().trim().min(2, "Nhập quận/huyện").max(100),
  ward: z.string().trim().max(100).nullable(),
  city: z.string().trim().min(2).max(100),
  lat: z.number().min(-90).max(90, "Vĩ độ không hợp lệ").nullable(),
  lng: z.number().min(-180).max(180, "Kinh độ không hợp lệ").nullable(),
  openingHours: z.string().trim().max(255).nullable(),
  description: z.string().trim().nullable(),
  commissionPercent: z.number().min(0).max(100, "0–100").nullable(),
  contact: z.string().trim().max(255).nullable(),
  status: z.enum(["draft", "published", "paused"]),
});

const issuesToErrors = (issues: z.core.$ZodIssue[]) => {
  const errors: Record<string, string> = {};
  for (const i of issues) errors[String(i.path[0])] ??= i.message;
  return errors;
};

export async function savePlace(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(formData.get("id")) || null;
  const str = (k: string) => String(formData.get(k) ?? "").trim() || null;
  // Cho dán "10.7496, 106.6110" từ Google Maps vào ô vĩ độ
  let lat = optionalNumber(formData.get("lat"));
  let lng = optionalNumber(formData.get("lng"));
  const coords = String(formData.get("lat") ?? "").match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/);
  if (coords) [lat, lng] = [Number(coords[1]), Number(coords[2])];

  const parsed = placeSchema.safeParse({
    name: formData.get("name"),
    slug: str("slug") ?? undefined,
    type: formData.get("type"),
    address: formData.get("address"),
    district: formData.get("district"),
    ward: str("ward"),
    city: str("city") ?? "TP. Hồ Chí Minh",
    lat,
    lng,
    openingHours: str("openingHours"),
    description: str("description"),
    commissionPercent: optionalNumber(formData.get("commissionPercent")),
    contact: str("contact"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { errors: issuesToErrors(parsed.error.issues), message: "Kiểm tra lại các ô báo đỏ." };
  const d = parsed.data;

  let images: string[] = [];
  try {
    const v = JSON.parse(String(formData.get("images") ?? "[]"));
    images = Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.startsWith("/uploads/")).slice(0, 12) : [];
  } catch {}

  const existing = id ? await db.place.findUnique({ where: { id }, select: { slug: true } }) : null;
  const slug =
    existing && (!d.slug || d.slug === existing.slug)
      ? existing.slug
      : await uniqueSlug(d.slug || `${d.name} ${d.district}`, async (s) => Boolean(await db.place.findFirst({ where: { slug: s, ...(id ? { id: { not: id } } : {}) }, select: { id: true } })));

  // Không cho slug quán trùng slug quận (vì dùng chung /an-uong/[slug])
  const data = { ...d, slug, nameSearch: toSearchText(d.name), districtSlug: slugify(d.district), images };
  let placeId = id;
  if (id) await db.place.update({ where: { id }, data });
  else placeId = (await db.place.create({ data })).id;
  revalidatePath("/an-uong", "layout");
  redirect(`/admin/places/${placeId}?ok=${id ? "saved" : "created"}`);
}

export async function deletePlace(formData: FormData) {
  await requireAdmin();
  await db.place.delete({ where: { id: Number(formData.get("id")) } }).catch(() => null);
  revalidatePath("/an-uong", "layout");
  redirect("/admin/places?ok=deleted");
}

const voucherSchema = z.object({
  title: z.string().trim().min(3, "Nhập tên ưu đãi").max(255),
  price: z.number().int().min(0),
  oldPrice: z.number().int().positive().nullable(),
  conditions: z.string().trim().nullable(),
  quantity: z.number().int().positive("Số lượng phải > 0").nullable(),
  status: z.enum(["draft", "published", "paused", "expired"]),
  startsAt: z.date().nullable(),
  expiresAt: z.date().nullable(),
});

export async function saveVoucher(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const placeId = Number(formData.get("placeId"));
  const id = Number(formData.get("voucherId")) || null;
  const qty = String(formData.get("quantity") ?? "").trim();
  const parsed = voucherSchema.safeParse({
    title: formData.get("title"),
    price: money(formData.get("price")) ?? 0,
    oldPrice: money(formData.get("oldPrice")),
    conditions: String(formData.get("conditions") ?? "").trim() || null,
    quantity: qty ? Number(qty) : null,
    status: formData.get("status"),
    startsAt: fromLocalInput(String(formData.get("startsAt") ?? "")),
    expiresAt: fromLocalInput(String(formData.get("expiresAt") ?? "")),
  });
  if (!parsed.success) return { errors: issuesToErrors(parsed.error.issues), message: "Kiểm tra lại ưu đãi." };
  if (id) await db.voucher.update({ where: { id }, data: parsed.data });
  else await db.voucher.create({ data: { ...parsed.data, placeId } });
  revalidatePath("/an-uong", "layout");
  redirect(`/admin/places/${placeId}?ok=saved#uu-dai`);
}
