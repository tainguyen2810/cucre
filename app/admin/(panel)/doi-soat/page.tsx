import type { Metadata } from "next";
import { Download } from "lucide-react";
import { TextInput } from "@/components/admin/fields";
import { requireAdmin } from "@/lib/admin/auth";
import { currentMonth, monthRange, reconcile } from "@/lib/admin/reconcile";
import { formatVnd } from "@/lib/format";
import { param } from "@/lib/url";

export const metadata: Metadata = { title: "Đối soát chiết khấu" };

export default async function ReconcilePage({ searchParams }: PageProps<"/admin/doi-soat">) {
  await requireAdmin();
  const raw = param(await searchParams, "thang");
  const month = raw && monthRange(raw) ? raw : currentMonth();
  const rows = await reconcile(month);
  const sum = (k: "issued" | "used" | "revenue" | "commission" | "usedWithoutPrice") => rows.reduce((s, r) => s + r[k], 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Đối soát chiết khấu</h1>
        <form className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="thang" className="text-xs font-semibold text-muted">Tháng</label>
            <TextInput id="thang" name="thang" type="month" defaultValue={month} />
          </div>
          <button type="submit" className="min-h-11 rounded-lg bg-ink px-4 text-sm font-bold text-white">Xem</button>
          <a href={`/admin/doi-soat/csv?thang=${month}`} className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-line-strong bg-surface px-3 text-sm font-bold hover:bg-canvas">
            <Download className="size-4" aria-hidden /> CSV
          </a>
        </form>
      </div>
      <p className="text-sm text-muted">“Đã dùng” tính theo ngày bấm “Đã dùng” trong tháng. Chiết khấu ước tính = giá voucher × số mã đã dùng × % chiết khấu. Ưu đãi giảm % (giá 0) cần quán báo giá trị hóa đơn.</p>
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-canvas text-left text-[13px] text-muted">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Quán</th>
              <th className="px-3 py-2.5 text-right font-semibold">Mã phát</th>
              <th className="px-3 py-2.5 text-right font-semibold">Đã dùng</th>
              <th className="px-3 py-2.5 text-right font-semibold">Doanh thu ước tính</th>
              <th className="px-3 py-2.5 text-right font-semibold">% CK</th>
              <th className="px-3 py-2.5 text-right font-semibold">Chiết khấu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line tabular-nums">
            {rows.map((r) => (
              <tr key={r.placeId}>
                <td className="px-3 py-2.5 font-semibold">{r.placeName}</td>
                <td className="px-3 py-2.5 text-right">{r.issued}</td>
                <td className="px-3 py-2.5 text-right">{r.used}</td>
                <td className="px-3 py-2.5 text-right">
                  {formatVnd(r.revenue)}
                  {r.usedWithoutPrice ? <span className="block text-xs text-warn">+{r.usedWithoutPrice} mã giảm % cần hóa đơn</span> : null}
                </td>
                <td className="px-3 py-2.5 text-right">{r.commissionPercent ?? "—"}</td>
                <td className="px-3 py-2.5 text-right font-bold">{formatVnd(r.commission)}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-muted">Chưa có mã nào trong tháng {month}.</td></tr>
            ) : (
              <tr className="bg-canvas font-bold">
                <td className="px-3 py-2.5">Tổng</td>
                <td className="px-3 py-2.5 text-right">{sum("issued")}</td>
                <td className="px-3 py-2.5 text-right">{sum("used")}</td>
                <td className="px-3 py-2.5 text-right">{formatVnd(sum("revenue"))}</td>
                <td />
                <td className="px-3 py-2.5 text-right">{formatVnd(sum("commission"))}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
