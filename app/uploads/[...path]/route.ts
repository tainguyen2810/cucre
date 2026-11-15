import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { resolveUpload } from "@/lib/uploads";

// Phục vụ ảnh upload khi chạy local. Trên server thật, Nginx phục vụ /uploads/ trực tiếp (nhanh hơn).
const TYPES: Record<string, string> = { webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", avif: "image/avif" };

export async function GET(_req: Request, ctx: RouteContext<"/uploads/[...path]">) {
  const { path: parts } = await ctx.params;
  const file = resolveUpload(parts);
  const ext = file?.split(".").pop()?.toLowerCase() ?? "";
  if (!file || !TYPES[ext]) return new NextResponse("Không tìm thấy", { status: 404 });
  try {
    const data = await readFile(file);
    return new NextResponse(new Uint8Array(data), {
      headers: { "Content-Type": TYPES[ext], "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new NextResponse("Không tìm thấy", { status: 404 });
  }
}
