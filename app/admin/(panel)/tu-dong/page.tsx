import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, CircleX } from "lucide-react";
import { approveAll, reviewItem } from "@/app/admin/(panel)/tu-dong/actions";
import { ImportPanel, TelegramPanel } from "@/components/admin/AutomationPanel";
import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { formatShortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Tự động hóa" };
const fmt = (d: Date) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(d);

function Env({ name, ok }: { name: string; ok: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {ok ? <CircleCheck className="size-4 text-ok" aria-hidden /> : <CircleX className="size-4 text-subtle" aria-hidden />}
      <code className="font-mono">{name}</code> <span className="text-muted">{ok ? "đã cấu hình" : "chưa có"}</span>
    </li>
  );
}

export default async function AutomationPage() {
  await requireAdmin();
  const hasAT = Boolean(process.env.ACCESSTRADE_API_KEY);
  const hasTG = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
  const [pendingCoupons, pendingDeals, runs] = await Promise.all([
    db.coupon.findMany({ where: { status: "pending" }, orderBy: { createdAt: "desc" }, take: 50, include: { platform: { select: { name: true } } } }),
    db.deal.findMany({ where: { status: "pending" }, orderBy: { createdAt: "desc" }, take: 50, select: { id: true, title: true, price: true, platform: { select: { name: true } } } }),
    db.jobRun.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold">Tự động hóa</h1>
        <p className="text-sm text-muted">Mã/deal nhập tự động luôn ở trạng thái <b>Chờ duyệt</b> và chỉ hiện trên web sau khi bạn duyệt. Bot Telegram chỉ gửi deal đã duyệt. Hướng dẫn: <code>docs/tu-dong-hoa.md</code>.</p>
      </div>

      <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 md:p-5" aria-labelledby="cho-duyet">
        <h2 id="cho-duyet" className="text-lg font-extrabold">Chờ duyệt ({pendingCoupons.length + pendingDeals.length})</h2>
        {pendingCoupons.length + pendingDeals.length === 0 ? <p className="text-sm text-muted">Không có mục nào chờ duyệt.</p> : null}
        {pendingCoupons.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold">Mã giảm giá</h3>
              <form action={approveAll}><input type="hidden" name="kind" value="coupon" /><button className="min-h-11 rounded-lg bg-ok px-3 text-sm font-bold text-white">Duyệt tất cả {pendingCoupons.length} mã</button></form>
            </div>
            <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
              {pendingCoupons.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-2 p-2.5">
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/coupons/${c.id}`} className="font-semibold hover:text-brand">{c.title}</Link>
                    <p className="text-[13px] text-muted">{c.platform.name}{c.code ? ` · ${c.code}` : " · không cần mã"}{c.expiresAt ? ` · HSD ${formatShortDate(c.expiresAt)}` : ""}</p>
                  </div>
                  <form action={reviewItem} className="flex gap-1">
                    <input type="hidden" name="kind" value="coupon" /><input type="hidden" name="id" value={c.id} />
                    <button name="decision" value="approve" className="min-h-11 rounded-lg bg-ok px-3 text-sm font-bold text-white">Duyệt</button>
                    <button name="decision" value="reject" className="min-h-11 rounded-lg border border-line-strong px-3 text-sm font-bold">Bỏ</button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {pendingDeals.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold">Deal</h3>
              <form action={approveAll}><input type="hidden" name="kind" value="deal" /><button className="min-h-11 rounded-lg bg-ok px-3 text-sm font-bold text-white">Duyệt tất cả {pendingDeals.length} deal</button></form>
            </div>
            <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
              {pendingDeals.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center gap-2 p-2.5">
                  <Link href={`/admin/deals/${d.id}`} className="min-w-0 flex-1 font-semibold hover:text-brand">{d.title} <span className="font-normal text-muted">· {d.platform.name}</span></Link>
                  <form action={reviewItem} className="flex gap-1">
                    <input type="hidden" name="kind" value="deal" /><input type="hidden" name="id" value={d.id} />
                    <button name="decision" value="approve" className="min-h-11 rounded-lg bg-ok px-3 text-sm font-bold text-white">Duyệt</button>
                    <button name="decision" value="reject" className="min-h-11 rounded-lg border border-line-strong px-3 text-sm font-bold">Về nháp</button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 md:p-5" aria-labelledby="nhap-ma">
          <h2 id="nhap-ma" className="text-lg font-extrabold">Nhập mã từ mạng affiliate</h2>
          <ul className="flex flex-col gap-1"><Env name="ACCESSTRADE_API_KEY" ok={hasAT} /></ul>
          <p className="text-[13px] text-muted">Tự chạy mỗi 6 giờ bằng cron (<code>npm run job:import</code>).</p>
          <ImportPanel enabled={hasAT} />
        </section>
        <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 md:p-5" aria-labelledby="telegram">
          <h2 id="telegram" className="text-lg font-extrabold">Kênh Telegram</h2>
          <ul className="flex flex-col gap-1"><Env name="TELEGRAM_BOT_TOKEN" ok={Boolean(process.env.TELEGRAM_BOT_TOKEN)} /><Env name="TELEGRAM_CHAT_ID" ok={Boolean(process.env.TELEGRAM_CHAT_ID)} /></ul>
          <p className="text-[13px] text-muted">Tự gửi 5 deal nổi bật lúc 11:30 mỗi ngày (<code>npm run job:telegram</code>).</p>
          <TelegramPanel enabled={hasTG} />
        </section>
      </div>

      <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 md:p-5" aria-labelledby="nhat-ky">
        <h2 id="nhat-ky" className="text-lg font-extrabold">Nhật ký chạy</h2>
        {runs.length === 0 ? <p className="text-sm text-muted">Chưa có lần chạy nào.</p> : null}
        <ul className="flex flex-col gap-1.5 text-sm">
          {runs.map((r) => (
            <li key={r.id} className="flex gap-2">
              {r.ok ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden /> : <CircleX className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />}
              <span className="shrink-0 tabular-nums text-muted">{fmt(r.createdAt)}</span>
              <span className="shrink-0 font-semibold">{r.job}</span>
              <span className="min-w-0 break-words">{r.summary}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
