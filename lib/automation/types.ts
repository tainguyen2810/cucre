// Dùng chung cho job (tsx) và Server Action – KHÔNG import "server-only" hay lib/db ở đây.
import type { PrismaClient } from "@/lib/generated/prisma/client";

export type Db = PrismaClient;

/** Mã giảm giá đã chuẩn hóa từ một nguồn bất kỳ */
export type ImportedCoupon = {
  source: string;
  externalId: string;
  platformSlug: string;
  platformName: string;
  title: string;
  code: string | null;
  conditions: string | null;
  url: string;
  startsAt: Date | null;
  expiresAt: Date | null;
};

export type ImportResult = { fetched: number; created: number; updated: number; skipped: number; errors: string[] };
