import "server-only";
import { db } from "@/lib/db";

/** "2026-11" → [đầu tháng, đầu tháng sau) theo giờ VN */
export function monthRange(month: string): [Date, Date] | null {
  const m = /^(\d{4})-(\d{2})$/.exec(month);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  if (mo < 1 || mo > 12) return null;
  const next = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`;
  return [new Date(`${month}-01T00:00:00+07:00`), new Date(`${next}-01T00:00:00+07:00`)];
}

export function currentMonth(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }).slice(0, 7);
}

export type ReconcileRow = {
  placeId: number;
  placeName: string;
  commissionPercent: number | null;
  issued: number;
  used: number;
  /** Doanh thu ước tính từ voucher có giá (giá voucher × số mã đã dùng) */
  revenue: number;
  /** Số mã đã dùng của voucher dạng giảm % (giá 0) – cần quán báo giá trị hóa đơn */
  usedWithoutPrice: number;
  commission: number;
};

/** Đối soát: số mã phát trong tháng, số mã đã dùng trong tháng, chiết khấu ước tính theo quán */
export async function reconcile(month: string): Promise<ReconcileRow[]> {
  const range = monthRange(month);
  if (!range) return [];
  const [from, to] = range;
  const [issued, used] = await Promise.all([
    db.voucherClaim.findMany({ where: { createdAt: { gte: from, lt: to }, status: { not: "cancelled" } }, select: { voucher: { select: { placeId: true } } } }),
    db.voucherClaim.findMany({ where: { status: "used", usedAt: { gte: from, lt: to } }, select: { voucher: { select: { placeId: true, price: true } } } }),
  ]);
  const ids = [...new Set([...issued, ...used].map((c) => c.voucher.placeId))];
  const places = await db.place.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, commissionPercent: true } });
  return places
    .map((p) => {
      const u = used.filter((c) => c.voucher.placeId === p.id);
      const revenue = u.reduce((s, c) => s + c.voucher.price, 0);
      return {
        placeId: p.id,
        placeName: p.name,
        commissionPercent: p.commissionPercent,
        issued: issued.filter((c) => c.voucher.placeId === p.id).length,
        used: u.length,
        revenue,
        usedWithoutPrice: u.filter((c) => c.voucher.price === 0).length,
        commission: Math.round((revenue * (p.commissionPercent ?? 0)) / 100),
      };
    })
    .sort((a, b) => b.used - a.used);
}
