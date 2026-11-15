"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";

export async function updateLead(formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status"));
  if (!["new", "contacted", "signed", "rejected"].includes(status)) return;
  await db.partnerLead.update({
    where: { id: Number(formData.get("id")) },
    data: { status: status as "new" | "contacted" | "signed" | "rejected", note: String(formData.get("note") ?? "").trim() || null },
  });
  revalidatePath("/admin/hop-tac");
}
