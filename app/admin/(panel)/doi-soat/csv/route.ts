import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { currentMonth, monthRange, reconcile } from "@/lib/admin/reconcile";

const cell = (v: string | number | null) => {
  const s = v === null ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Tải file CSV đối soát (mở bằng Excel, có BOM để hiện đúng tiếng Việt) */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Chưa đăng nhập", { status: 401 });
  const raw = req.nextUrl.searchParams.get("thang") ?? "";
  const month = monthRange(raw) ? raw : currentMonth();
  const rows = await reconcile(month);
  const lines = [
    ["Quán", "Mã phát", "Đã dùng", "Doanh thu ước tính (đ)", "Mã giảm % cần hóa đơn", "% chiết khấu", "Chiết khấu (đ)"],
    ...rows.map((r) => [r.placeName, r.issued, r.used, r.revenue, r.usedWithoutPrice, r.commissionPercent, r.commission]),
  ];
  const csv = "﻿" + lines.map((l) => l.map(cell).join(",")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="doi-soat-${month}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
