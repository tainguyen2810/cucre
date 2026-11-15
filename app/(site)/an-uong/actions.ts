"use server";

import { randomInt } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { normalizeVnPhone } from "@/lib/phone";
import { clientIp, dailyIpHash } from "@/lib/request";
import { verifyTurnstile } from "@/lib/turnstile";

export type ClaimState = { ok?: boolean; code?: string; message?: string; errors?: Record<string, string> };

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // bỏ 0/O, 1/I dễ nhầm
const makeCode = () => `CR${Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")}`;

const schema = z.object({
  voucherId: z.coerce.number().int().positive(),
  fullName: z.string().trim().min(2, "Nhập họ tên").max(120, "Họ tên quá dài"),
  phone: z.string().transform((v, ctx) => {
    const p = normalizeVnPhone(v);
    if (!p) ctx.addIssue({ code: "custom", message: "Số điện thoại chưa đúng (VD: 0901234567)" });
    return p ?? "";
  }),
  consent: z.literal("on", { error: "Cần đồng ý để nhận mã" }),
});

const MAX_PER_IP_PER_HOUR = 5;

export async function claimVoucher(_prev: ClaimState, formData: FormData): Promise<ClaimState> {
  // Bẫy bot: ô ẩn phải để trống
  if (String(formData.get("website") ?? "")) return { message: "Không gửi được, vui lòng thử lại." };

  const parsed = schema.safeParse({
    voucherId: formData.get("voucherId"),
    fullName: formData.get("fullName"),
    phone: String(formData.get("phone") ?? ""),
    consent: formData.get("consent"),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { errors };
  }
  const { voucherId, fullName, phone } = parsed.data;

  const h = await headers();
  const ip = clientIp(h);
  if (!(await verifyTurnstile(String(formData.get("cf-turnstile-response") ?? "") || null, ip))) {
    return { message: "Chưa xác minh được bạn không phải robot. Tải lại trang và thử lại." };
  }
  const ipHash = dailyIpHash(ip);
  if (ipHash) {
    const recent = await db.voucherClaim.count({ where: { ipHash, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } } });
    if (recent >= MAX_PER_IP_PER_HOUR) return { message: "Bạn đã nhận nhiều mã trong 1 giờ qua. Thử lại sau nhé." };
  }

  const voucher = await db.voucher.findUnique({ where: { id: voucherId }, include: { place: { select: { status: true } } } });
  const now = new Date();
  if (
    !voucher ||
    voucher.status !== "published" ||
    voucher.place.status !== "published" ||
    (voucher.expiresAt && voucher.expiresAt < now) ||
    (voucher.startsAt && voucher.startsAt > now)
  ) {
    return { message: "Ưu đãi này đã kết thúc hoặc chưa mở." };
  }

  const existing = await db.voucherClaim.findUnique({ where: { voucherId_phone: { voucherId, phone } }, select: { id: true } });
  if (existing) return { message: "Số điện thoại này đã nhận mã cho ưu đãi này rồi. Khi đến quán, bạn chỉ cần đọc số điện thoại để quán tra mã." };

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const code = await db.$transaction(async (tx) => {
        if (voucher.quantity !== null) {
          const issued = await tx.voucherClaim.count({ where: { voucherId, status: { in: ["issued", "used"] } } });
          if (issued >= voucher.quantity) throw new Error("SOLD_OUT");
        }
        const c = makeCode();
        await tx.voucherClaim.create({ data: { voucherId, fullName, phone, code: c, consentAt: now, ipHash } });
        return c;
      });
      return { ok: true, code };
    } catch (error) {
      if (error instanceof Error && error.message === "SOLD_OUT") return { message: "Ưu đãi đã hết lượt. Hẹn bạn ở ưu đãi sau!" };
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const target = String(error.meta?.target ?? "");
        if (target.includes("phone")) return { message: "Số điện thoại này đã nhận mã cho ưu đãi này rồi." };
        continue; // trùng mã ngẫu nhiên → thử mã khác
      }
      throw error;
    }
  }
  return { message: "Hệ thống bận, vui lòng thử lại." };
}
