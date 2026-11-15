"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { normalizeVnPhone } from "@/lib/phone";
import { clientIp } from "@/lib/request";
import { verifyTurnstile } from "@/lib/turnstile";

export type LeadState = { ok?: boolean; message?: string; errors?: Record<string, string> };

// Giới hạn đơn giản trong bộ nhớ: 3 đơn / giờ / IP
const recent = new Map<string, number[]>();

const schema = z.object({
  placeName: z.string().trim().min(2, "Nhập tên quán").max(191),
  placeType: z.string().trim().min(2, "Chọn loại hình").max(100),
  address: z.string().trim().min(5, "Nhập địa chỉ").max(255),
  contactName: z.string().trim().min(2, "Nhập tên người liên hệ").max(120),
  phone: z.string().transform((v, ctx) => {
    const p = normalizeVnPhone(v);
    if (!p) ctx.addIssue({ code: "custom", message: "Số điện thoại chưa đúng" });
    return p ?? "";
  }),
  email: z.union([z.literal(""), z.email("Email chưa đúng").max(191)]),
  proposedCommission: z.string().trim().max(50),
  offer: z.string().trim().max(2000),
  consent: z.literal("on", { error: "Cần đồng ý để gửi" }),
});

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  if (String(formData.get("website") ?? "")) return { message: "Không gửi được." };
  const parsed = schema.safeParse(Object.fromEntries(["placeName", "placeType", "address", "contactName", "phone", "email", "proposedCommission", "offer", "consent"].map((k) => [k, String(formData.get(k) ?? "")])));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { errors };
  }
  const ip = clientIp(await headers()) ?? "unknown";
  if (!(await verifyTurnstile(String(formData.get("cf-turnstile-response") ?? "") || null, ip))) return { message: "Chưa xác minh được, tải lại trang và thử lại." };
  const times = (recent.get(ip) ?? []).filter((t) => t > Date.now() - 3_600_000);
  if (times.length >= 3) return { message: "Bạn đã gửi nhiều đơn, chúng tôi sẽ liên hệ sớm." };
  recent.set(ip, [...times, Date.now()]);

  const d = parsed.data;
  await db.partnerLead.create({
    data: {
      placeName: d.placeName,
      placeType: d.placeType,
      address: d.address,
      contactName: d.contactName,
      phone: d.phone,
      email: d.email || null,
      proposedCommission: d.proposedCommission || null,
      offer: d.offer || null,
      consentAt: new Date(),
    },
  });
  return { ok: true };
}
