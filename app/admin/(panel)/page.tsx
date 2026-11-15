import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/admin/auth";
import { clicksByDay, clicksByPlatform, overviewCounts, topDeals } from "@/lib/admin/stats";

export const metadata: Metadata = { title: "Tổng quan" };

function Stat({ label, value, href, note }: { label: string; value: number; href?: string; note?: string }) {
  const body = (
    <>
      <span className="text-[13px] text-muted">{label}</span>
      <span className="text-2xl font-extrabold tabular-nums">{value.toLocaleString("vi-VN")}</span>
      {note ? <span className="text-xs font-semibold text-info">{note}</span> : null}
    </>
  );
  const cls = "flex flex-col gap-0.5 rounded-xl border border-line bg-surface p-4";
  return href ? <Link href={href} className={`${cls} hover:border-ink`}>{body}</Link> : <div className={cls}>{body}</div>;
}

export default async function AdminHome() {
  await requireAdmin();
  const [counts, days, platforms, top] = await Promise.all([overviewCounts(), clicksByDay(14), clicksByPlatform(7), topDeals(7)]);
  const maxDay = Math.max(1, ...days.map((d) => d.clicks));
  const total14 = days.reduce((s, d) => s + d.clicks, 0);
  const maxPlatform = Math.max(1, ...platforms.map((p) => p.clicks));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Tổng quan</h1>
        <div className="flex gap-2">
          <LinkButton href="/admin/deals/new"><Plus className="size-4" aria-hidden /> Deal</LinkButton>
          <LinkButton href="/admin/coupons/new" variant="light"><Plus className="size-4" aria-hidden /> Mã</LinkButton>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Click hôm nay" value={counts.clicksToday} />
        <Stat label="Deal đang hiện" value={counts.activeDeals} href="/admin/deals?trang-thai=published" note={counts.pendingDeals ? `${counts.pendingDeals} chờ duyệt` : undefined} />
        <Stat label="Mã đang chạy" value={counts.activeCoupons} href="/admin/coupons?trang-thai=published" note={counts.pendingCoupons ? `${counts.pendingCoupons} chờ duyệt` : undefined} />
        <Stat label="Mã voucher phát hôm nay" value={counts.claimsToday} href="/admin/nhan-ma" note={counts.newLeads ? `${counts.newLeads} đơn hợp tác mới` : undefined} />
      </div>

      <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 md:p-5" aria-labelledby="click-ngay">
        <h2 id="click-ngay" className="text-lg font-extrabold">Click theo ngày (14 ngày)</h2>
        <div className="flex h-44 items-end gap-1 md:gap-2" role="img" aria-label={`Tổng ${total14} click trong 14 ngày`}>
          {days.map((d) => (
            <div key={d.day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[11px] font-semibold tabular-nums text-muted">{d.clicks || ""}</span>
              <div className="w-full rounded-t-sm bg-brand" style={{ height: `${(d.clicks / maxDay) * 100}%`, minHeight: d.clicks ? 3 : 1, opacity: d.clicks ? 1 : 0.15 }} title={`${d.day}: ${d.clicks} click, ${d.people} người`} />
              <span className="text-[10px] text-muted tabular-nums">{d.day.slice(8)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted">Cột là số lượt bấm ra sàn. “Người” = số người khác nhau trong ngày (đếm theo mã băm, không lưu IP).</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 md:p-5" aria-labelledby="click-san">
          <h2 id="click-san" className="text-lg font-extrabold">Click theo sàn (7 ngày)</h2>
          {platforms.length === 0 ? <p className="text-sm text-muted">Chưa có click.</p> : null}
          <ul className="flex flex-col gap-2.5">
            {platforms.map((p) => (
              <li key={p.name} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{p.name}</span>
                  <span className="tabular-nums text-muted">{p.clicks} lượt · {p.people} người</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-placeholder">
                  <div className="h-full rounded-full bg-ink" style={{ width: `${(p.clicks / maxPlatform) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 md:p-5" aria-labelledby="top-deal">
          <h2 id="top-deal" className="text-lg font-extrabold">Deal nhiều click nhất (7 ngày)</h2>
          {top.length === 0 ? <p className="text-sm text-muted">Chưa có click.</p> : null}
          <ol className="flex flex-col gap-2">
            {top.map((d, i) => (
              <li key={d.id} className="flex items-baseline gap-2 text-sm">
                <span className="w-5 shrink-0 text-right font-bold text-muted tabular-nums">{i + 1}</span>
                <Link href={`/admin/deals/${d.id}`} className="line-clamp-1 flex-1 hover:text-brand">{d.title}</Link>
                <span className="shrink-0 font-bold tabular-nums">{d.clicks}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
