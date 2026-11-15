import "server-only";
import path from "node:path";

/** Thư mục lưu ảnh (ngoài thư mục code). Mặc định ./uploads khi chạy local. */
export function uploadDir(): string {
  return path.resolve(process.env.UPLOAD_DIR || "./uploads");
}

/** Đường dẫn tuyệt đối an toàn từ phần sau /uploads/; trả null nếu cố thoát ra ngoài thư mục. */
export function resolveUpload(parts: string[]): string | null {
  const root = uploadDir();
  const full = path.resolve(root, ...parts);
  return full.startsWith(root + path.sep) ? full : null;
}
