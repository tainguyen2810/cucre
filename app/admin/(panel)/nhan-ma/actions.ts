"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";

/** Đổi trạng thái mã: used (đã dùng), cancelled (hủy), issued (khôi phục) */
export async function setClaimStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["issued", "used", "cancelled"].includes(status)) return;
  await db.voucherClaim.update({
    where: { id },
    data: { status: status as "issued" | "used" | "cancelled", usedAt: status === "used" ? new Date() : null },
  });
  revalidatePath("/admin/nhan-ma");
}
