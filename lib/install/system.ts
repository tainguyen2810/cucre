import { accessSync, constants, mkdirSync } from "node:fs";
import path from "node:path";

export type Check = { label: string; ok: boolean; detail: string; required: boolean };

/** Kiểm tra môi trường server trước khi cài */
export function systemChecks(uploadDir?: string): Check[] {
  const [major, minor] = process.versions.node.split(".").map(Number);
  const nodeOk = major > 20 || (major === 20 && minor >= 19);
  const cwd = process.cwd();
  const writable = (dir: string) => {
    try {
      accessSync(dir, constants.W_OK);
      return true;
    } catch {
      return false;
    }
  };
  const checks: Check[] = [
    { label: "Node.js", ok: nodeOk, detail: `v${process.versions.node}${nodeOk ? "" : " – cần 20.19 trở lên"}`, required: true },
    { label: "Ghi được file .env", ok: writable(cwd), detail: cwd, required: true },
    { label: "Chạy bằng PM2", ok: process.env.pm_id !== undefined, detail: process.env.pm_id !== undefined ? "Có – sẽ tự khởi động lại sau khi cài" : "Không – sau khi cài cần khởi động lại thủ công", required: false },
    { label: "Đã build bản production", ok: process.env.NODE_ENV === "production", detail: process.env.NODE_ENV === "production" ? "npm run build + next start" : `Đang chạy chế độ ${process.env.NODE_ENV ?? "?"}`, required: false },
  ];
  if (uploadDir) {
    const dir = path.resolve(uploadDir);
    let ok = false;
    try {
      mkdirSync(dir, { recursive: true });
      ok = writable(dir);
    } catch {}
    checks.push({ label: "Thư mục ảnh upload", ok, detail: ok ? dir : `${dir} – không tạo/ghi được`, required: true });
  }
  return checks;
}
