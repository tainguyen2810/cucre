import { CalendarDays } from "lucide-react";
import { db } from "@/lib/db";
import { daysAgo } from "@/lib/dates";

const fmt = (d: Date) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(d);

function status(startsAt: Date, endsAt: Date, now: number) {
  if (startsAt.getTime() <= now && endsAt.getTime() >= now) return { label: "Đang diễn ra", tone: "bg-brand text-white" };
  const days = Math.ceil((startsAt.getTime() - now) / 86_400_000);
  return { label: days <= 1 ? "Ngày mai" : `Còn ${days} ngày`, tone: "bg-flash text-ink" };
}

/** Lịch sale sắp tới (60 ngày) và đang diễn ra */
export async function SaleCalendar() {
  const now = daysAgo(0);
  const events = await db.saleEvent.findMany({
    where: { endsAt: { gte: now }, startsAt: { lte: new Date(now.getTime() + 60 * 86_400_000) } },
    orderBy: { startsAt: "asc" },
    take: 6,
  });
  if (events.length === 0) return null;
  const t = now.getTime();
  return (
    <section aria-labelledby="lich-sale" className="flex flex-col gap-3">
      <h2 id="lich-sale" className="flex items-center gap-2 text-lg font-extrabold">
        <CalendarDays className="size-5 text-brand" aria-hidden /> Lịch sale sắp tới
      </h2>
      <ol className="-mx-4 md:mx-0">
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1 md:px-0">
          {events.map((e) => {
            const s = status(e.startsAt, e.endsAt, t);
            const sameDay = fmt(e.startsAt) === fmt(e.endsAt);
            return (
              <li key={e.id} className="flex w-60 shrink-0 flex-col gap-1.5 rounded-xl border border-line bg-surface p-3.5">
                <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-bold ${s.tone}`}>{s.label}</span>
                <p className="font-bold">{e.name}</p>
                <p className="text-sm text-muted">{sameDay ? fmt(e.startsAt) : `${fmt(e.startsAt)} – ${fmt(e.endsAt)}`}</p>
                {e.description ? <p className="line-clamp-2 text-[13px] text-muted">{e.description}</p> : null}
              </li>
            );
          })}
        </div>
      </ol>
    </section>
  );
}
