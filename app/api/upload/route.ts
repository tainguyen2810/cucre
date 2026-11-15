import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { auth } from "@/lib/auth";
import { uploadDir } from "@/lib/uploads";

// Nhận 1 ảnh (field "file"), thu nhỏ còn tối đa 1200px, đổi sang WebP, lưu vào UPLOAD_DIR/yyyy/mm/.
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Chưa chọn ảnh" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Chỉ nhận ảnh JPG, PNG, WebP, GIF, AVIF" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Ảnh lớn hơn 8MB" }, { status: 400 });

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const output = await sharp(input).rotate().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    const now = new Date();
    const sub = path.join(String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, "0"));
    const name = `${randomBytes(8).toString("hex")}.webp`;
    await mkdir(path.join(uploadDir(), sub), { recursive: true });
    await writeFile(path.join(uploadDir(), sub, name), output);
    return NextResponse.json({ url: `/uploads/${sub.split(path.sep).join("/")}/${name}` });
  } catch (error) {
    console.error("Lỗi xử lý ảnh", error);
    return NextResponse.json({ error: "Không đọc được ảnh, thử ảnh khác" }, { status: 400 });
  }
}
