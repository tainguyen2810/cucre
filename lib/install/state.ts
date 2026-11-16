import { randomBytes } from "node:crypto";
import { chmodSync, existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

// Trạng thái cài đặt. Dùng được trong proxy.ts (Node runtime) và Server Action.

export const ENV_PATH = path.join(process.cwd(), ".env");
const TOKEN_PATH = path.join(process.cwd(), ".setup-token");

/** Đọc file .env trên đĩa (không phụ thuộc process.env – để biết đã ghi nhưng chưa khởi động lại) */
export function readEnvFile(file = ENV_PATH): Record<string, string> {
  if (!existsSync(file)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    out[m[1]] = v;
  }
  return out;
}

let installedCache = false;

/** Đã cài khi có DATABASE_URL + AUTH_SECRET (trong tiến trình hoặc trong file .env) */
export function isInstalled(): boolean {
  if (installedCache) return true;
  if (process.env.DATABASE_URL && process.env.AUTH_SECRET) return (installedCache = true);
  const file = readEnvFile();
  return Boolean(file.DATABASE_URL && file.AUTH_SECRET);
}

/** Đã ghi .env nhưng tiến trình chưa nạp (cần khởi động lại) */
export function needsRestart(): boolean {
  return !(process.env.DATABASE_URL && process.env.AUTH_SECRET) && isInstalled();
}

/** Mã cài đặt: tạo một lần, lưu trong file .setup-token (chỉ người có quyền vào server đọc được) */
export function getSetupToken(): string {
  if (existsSync(TOKEN_PATH)) return readFileSync(TOKEN_PATH, "utf8").trim();
  const token = randomBytes(12).toString("hex");
  writeFileSync(TOKEN_PATH, `${token}\n`, { mode: 0o600 });
  try {
    chmodSync(TOKEN_PATH, 0o600);
  } catch {}
  console.log(`\n[cucre] Mã cài đặt cho /cai-dat: ${token}\n        (xem lại: cat ${TOKEN_PATH})\n`);
  return token;
}

export function removeSetupToken() {
  try {
    unlinkSync(TOKEN_PATH);
  } catch {}
}

/** Ghi .env: giữ các biến cũ không bị thay, sao lưu file cũ, quyền 600 */
export function writeEnvFile(values: Record<string, string>) {
  const current = readEnvFile();
  if (existsSync(ENV_PATH)) writeFileSync(`${ENV_PATH}.backup-${Date.now()}`, readFileSync(ENV_PATH), { mode: 0o600 });
  const merged = { ...current, ...values };
  const quote = (v: string) => `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  const body = [
    "# Tạo bởi wizard /cai-dat – có thể sửa tay. Đổi xong chạy: pm2 restart cucre",
    ...Object.entries(merged).map(([k, v]) => `${k}=${quote(v)}`),
    "",
  ].join("\n");
  writeFileSync(ENV_PATH, body, { mode: 0o600 });
  try {
    chmodSync(ENV_PATH, 0o600);
  } catch {}
}
