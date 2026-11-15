"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { type FormState, fromLocalInput } from "@/lib/admin/form";
import { uniqueSlug } from "@/lib/admin/slug";

const schema = z
  .object({
    name: z.string().trim().min(3, "Nhập tên đợt sale").max(120),
    description: z.string().trim().max(500).nullable(),
    startsAt: z.date({ error: "Chọn ngày bắt đầu" }),
    endsAt: z.date({ error: "Chọn ngày kết thúc" }),
  })
  .refine((v) => v.endsAt >= v.startsAt, { message: "Kết thúc phải sau bắt đầu", path: ["endsAt"] });

export async function saveSaleEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(formData.get("id")) || null;
  const parsed = schema.safeParse({
    name: formData.get("name"),
    description: String(formData.get("description") ?? "").trim() || null,
    startsAt: fromLocalInput(String(formData.get("startsAt") ?? "")) ?? undefined,
    endsAt: fromLocalInput(String(formData.get("endsAt") ?? "")) ?? undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { errors, message: "Kiểm tra lại các ô báo đỏ." };
  }
  const d = parsed.data;
  if (id) await db.saleEvent.update({ where: { id }, data: d });
  else {
    const slug = await uniqueSlug(`${d.name} ${d.startsAt.getFullYear()}`, async (s) => Boolean(await db.saleEvent.findUnique({ where: { slug: s }, select: { id: true } })));
    await db.saleEvent.create({ data: { ...d, slug } });
  }
  revalidatePath("/ma-giam-gia", "layout");
  redirect(`/admin/lich-sale?ok=${id ? "saved" : "created"}`);
}

export async function deleteSaleEvent(formData: FormData) {
  await requireAdmin();
  await db.saleEvent.delete({ where: { id: Number(formData.get("id")) } }).catch(() => null);
  revalidatePath("/ma-giam-gia", "layout");
  redirect("/admin/lich-sale?ok=deleted");
}
