"use server";

import { randomBytes, timingSafeEqual } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { buildDatabaseUrl, checkDatabase, type DbCheck } from "@/lib/install/database";
import { getSetupToken, isInstalled, removeSetupToken, writeEnvFile } from "@/lib/install/state";
import { systemChecks, type Check } from "@/lib/install/system";

const COOKIE = "cucre_setup";

function sameToken(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Mọi bước đều yêu cầu: chưa cài + đã nhập đúng mã cài đặt */
async function guard(): Promise<string | null> {
  if (isInstalled()) return "Website đã được cài đặt. Wizard đã khóa.";
  const token = (await cookies()).get(COOKIE)?.value ?? "";
  if (!token || !sameToken(token, getSetupToken())) return "Phiên cài đặt hết hạn, nhập lại mã cài đặt.";
  return null;
}

export async function verifyToken(token: string): Promise<{ ok: boolean; message?: string }> {
  if (isInstalled()) return { ok: false, message: "Website đã được cài đặt." };
  const clean = token.trim().toLowerCase();
  if (!clean || !sameToken(clean, getSetupToken())) {
    await new Promise((r) => setTimeout(r, 800)); // làm chậm dò mã
    return { ok: false, message: "Mã cài đặt không đúng." };
  }
  (await cookies()).set(COOKIE, clean, { httpOnly: true, sameSite: "strict", path: "/cai-dat", maxAge: 2 * 60 * 60 });
  return { ok: true };
}

export async function runSystemChecks(uploadDir: string): Promise<{ checks?: Check[]; message?: string }> {
  const err = await guard();
  if (err) return { message: err };
  return { checks: systemChecks(uploadDir || "./uploads") };
}

const dbSchema = z.object({
  host: z.string().trim().min(1, "Nhập host").max(255),
  port: z.coerce.number().int().min(1).max(65535),
  database: z.string().trim().min(1, "Nhập tên database").max(64).regex(/^[A-Za-z0-9_$-]+$/, "Tên database chỉ gồm chữ, số, _ , -"),
  user: z.string().trim().min(1, "Nhập user").max(80),
  password: z.string().max(200),
});

export async function testDatabase(input: z.input<typeof dbSchema>): Promise<DbCheck> {
  const err = await guard();
  if (err) return { ok: false, message: err };
  const parsed = dbSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return checkDatabase(parsed.data);
}

const installSchema = z.object({
  db: dbSchema,
  siteUrl: z.url({ protocol: /^https?$/, error: "Địa chỉ web phải dạng https://ten-mien" }),
  uploadDir: z.string().trim().min(1).max(255),
  zaloUrl: z.union([z.literal(""), z.url({ error: "Link Zalo chưa đúng" })]),
  adminEmail: z.email("Email admin chưa đúng").max(191),
  adminPassword: z.string().min(10, "Mật khẩu admin tối thiểu 10 ký tự").max(200),
  accesstradeKey: z.string().trim().max(200),
  telegramToken: z.string().trim().max(200),
  telegramChatId: z.string().trim().max(100),
  turnstileSiteKey: z.string().trim().max(200),
  turnstileSecretKey: z.string().trim().max(200),
});

export type InstallInput = z.input<typeof installSchema>;
export type InstallResult = {
  ok: boolean;
  message?: string;
  steps?: { label: string; ok: boolean; detail?: string }[];
  nginx?: string;
  cron?: string;
  restarting?: boolean;
  appDir?: string;
};

export async function install(input: InstallInput): Promise<InstallResult> {
  const err = await guard();
  if (err) return { ok: false, message: err };
  const parsed = installSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const d = parsed.data;
  const steps: NonNullable<InstallResult["steps"]> = [];
  const cwd = process.cwd();

  // 1. Database
  const check = await checkDatabase(d.db);
  steps.push({ label: "Kết nối database", ok: check.ok, detail: check.message });
  if (!check.ok) return { ok: false, steps, message: check.message };
  const databaseUrl = buildDatabaseUrl(d.db);

  // 2. Tạo bảng (prisma migrate deploy)
  const migrate = spawnSync(process.execPath, [path.join(cwd, "node_modules", "prisma", "build", "index.js"), "migrate", "deploy"], {
    cwd,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    encoding: "utf8",
    timeout: 180_000,
  });
  const migrateOut = `${migrate.stdout ?? ""}${migrate.stderr ?? ""}`;
  const migrated = migrate.status === 0;
  steps.push({ label: "Tạo bảng dữ liệu", ok: migrated, detail: migrated ? `Đã áp dụng ${migrateOut.match(/(\d+) migrations? found/)?.[1] ?? "các"} bản cập nhật cấu trúc` : migrateOut.slice(-600) });
  if (!migrated) return { ok: false, steps, message: "Không tạo được bảng. Xem chi tiết lỗi bên dưới." };

  // 3. Tài khoản admin
  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });
  try {
    const email = d.adminEmail.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(d.adminPassword, 12);
    await prisma.adminUser.upsert({ where: { email }, update: { passwordHash, role: "admin" }, create: { email, passwordHash, role: "admin", name: "Quản trị" } });
    steps.push({ label: "Tạo tài khoản admin", ok: true, detail: email });
  } catch (error) {
    steps.push({ label: "Tạo tài khoản admin", ok: false, detail: error instanceof Error ? error.message : String(error) });
    return { ok: false, steps, message: "Không tạo được tài khoản admin." };
  } finally {
    await prisma.$disconnect().catch(() => {});
  }

  // 4. Ghi .env
  const siteUrl = d.siteUrl.replace(/\/$/, "");
  const uploadDir = path.resolve(d.uploadDir);
  writeEnvFile({
    DATABASE_URL: databaseUrl,
    AUTH_SECRET: randomBytes(32).toString("base64"),
    SITE_URL: siteUrl,
    UPLOAD_DIR: uploadDir,
    ZALO_URL: d.zaloUrl,
    ACCESSTRADE_API_KEY: d.accesstradeKey,
    TELEGRAM_BOT_TOKEN: d.telegramToken,
    TELEGRAM_CHAT_ID: d.telegramChatId,
    TURNSTILE_SITE_KEY: d.turnstileSiteKey,
    TURNSTILE_SECRET_KEY: d.turnstileSecretKey,
  });
  steps.push({ label: "Lưu cấu hình (.env)", ok: true, detail: path.join(cwd, ".env") });
  // Xóa file mã → cookie phiên cài đặt tự vô hiệu. KHÔNG sửa cookie ở đây: việc đó khiến Next vẽ lại trang
  // ngay trong phản hồi và mất màn hình kết quả (cấu hình Nginx, cron).
  removeSetupToken();

  // 5. Cấu hình Nginx + cron để dán vào aaPanel
  const host = new URL(siteUrl).hostname;
  let nginx = "";
  try {
    nginx = readFileSync(path.join(cwd, "deploy", "nginx-cucre.conf"), "utf8")
      .replace(/www\.cucre\.vn/g, host.startsWith("www.") ? host : `www.${host}`)
      .replace(/https:\/\/cucre\.vn/g, `https://${host.replace(/^www\./, "")}`)
      .replace(/cucre\.vn/g, host.replace(/^www\./, ""))
      .replace(/\/www\/cucre-uploads\//g, `${uploadDir}/`);
  } catch {}
  const cron = [
    `# Mỗi giờ (phút 5): ẩn deal/mã hết hạn`,
    `cd ${cwd} && npm run job:expire >> logs/cron.log 2>&1`,
    `# Hằng ngày 00:20: ghi lịch sử giá`,
    `cd ${cwd} && npm run job:prices >> logs/cron.log 2>&1`,
    `# Hằng ngày 03:15: sao lưu database`,
    `bash ${cwd}/scripts/backup-mysql.sh >> ${cwd}/logs/backup.log 2>&1`,
    `# Mỗi 6 giờ: nhập mã affiliate (khi có ACCESSTRADE_API_KEY)`,
    `cd ${cwd} && npm run job:import >> logs/cron.log 2>&1`,
    `# Hằng ngày 11:30: gửi deal lên Telegram (khi có token)`,
    `cd ${cwd} && npm run job:telegram >> logs/cron.log 2>&1`,
  ].join("\n");

  // 6. Khởi động lại để nạp .env mới (PM2 tự bật lại tiến trình)
  const restarting = process.env.pm_id !== undefined;
  if (restarting) setTimeout(() => process.exit(0), 1500);

  return { ok: true, steps, nginx, cron, restarting, appDir: cwd };
}
