"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import type { FormState } from "@/lib/admin/form";

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (next.length < 10) return { errors: { next: "Mật khẩu mới tối thiểu 10 ký tự" } };
  if (next !== confirm) return { errors: { confirm: "Nhập lại không khớp" } };
  const user = await db.adminUser.findUnique({ where: { email: me.email ?? "" } });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) return { errors: { current: "Mật khẩu hiện tại không đúng" } };
  await db.adminUser.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  redirect("/admin/tai-khoan?ok=password");
}
