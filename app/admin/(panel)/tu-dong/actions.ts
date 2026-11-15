"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { runCouponImport } from "@/lib/automation/import";
import { runTelegramDaily } from "@/lib/automation/telegram";

export type AutoState = { ok?: boolean; summary?: string; message?: string };

export async function runImportNow(): Promise<AutoState> {
  await requireAdmin();
  const r = await runCouponImport(db);
  revalidatePath("/admin/tu-dong");
  return r;
}

export async function previewTelegram(): Promise<AutoState> {
  await requireAdmin();
  return runTelegramDaily(db, process.env, true);
}

export async function sendTelegramNow(): Promise<AutoState> {
  await requireAdmin();
  const r = await runTelegramDaily(db, process.env, false);
  revalidatePath("/admin/tu-dong");
  return r;
}

/** Duyệt hàng loạt: chuyển mục chờ duyệt sang đang hiện */
export async function approveAll(formData: FormData) {
  await requireAdmin();
  const kind = String(formData.get("kind"));
  if (kind === "coupon") await db.coupon.updateMany({ where: { status: "pending" }, data: { status: "published" } });
  if (kind === "deal") await db.deal.updateMany({ where: { status: "pending" }, data: { status: "published", publishedAt: new Date() } });
  revalidatePath("/", "layout");
}

/** Duyệt / từ chối từng mục */
export async function reviewItem(formData: FormData) {
  await requireAdmin();
  const kind = String(formData.get("kind"));
  const id = Number(formData.get("id"));
  const approve = formData.get("decision") === "approve";
  if (kind === "coupon") {
    if (approve) await db.coupon.update({ where: { id }, data: { status: "published" } });
    else await db.coupon.delete({ where: { id } }).catch(() => null);
  }
  if (kind === "deal") {
    if (approve) await db.deal.update({ where: { id }, data: { status: "published", publishedAt: new Date() } });
    else await db.deal.update({ where: { id }, data: { status: "draft" } });
  }
  revalidatePath("/", "layout");
}
