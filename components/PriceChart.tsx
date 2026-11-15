import { formatShortDate, formatShortVnd, formatVnd } from "@/lib/format";

type Point = { price: number; recordedAt: Date };

/** Số ngày khác nhau tối thiểu để hiện biểu đồ (CLAUDE.md: không hiện khi chưa đủ dữ liệu). */
export const MIN_PRICE_DAYS = 7;

/** Giữ giá cuối cùng của mỗi ngày (giờ VN). */
function dailyPoints(points: Point[]): Point[] {
  const byDay = new Map<string, Point>();
  for (const p of points) {
    byDay.set(p.recordedAt.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }), p);
  }
  return [...byDay.values()];
}

/** Biểu đồ giá 30 ngày, vẽ bằng SVG phía server (không cần thư viện). */
export function PriceChart({ points, currentPrice }: { points: Point[]; currentPrice: number }) {
  const data = dailyPoints(points);
  if (data.length < MIN_PRICE_DAYS) return null;

  const prices = data.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const lowestNow = currentPrice <= min;

  // Toạ độ vẽ 0–100 (SVG co giãn theo khung); chữ và điểm cuối là HTML nên luôn giữ cỡ chữ.
  const range = max - min || max * 0.1 || 1;
  const yMin = min - range * 0.15;
  const yMax = max + range * 0.15;
  const x = (i: number) => (data.length === 1 ? 50 : (i / (data.length - 1)) * 100);
  const y = (v: number) => (1 - (v - yMin) / (yMax - yMin)) * 100;

  const line = data.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)},${y(p.price).toFixed(2)}`).join(" ");
  const area = `${line} L100,100 L0,100 Z`;
  const last = data[data.length - 1];
  const ticks = [max, (max + min) / 2, min];

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 md:p-5" aria-labelledby="lich-su-gia">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="lich-su-gia" className="text-lg font-extrabold">
          Lịch sử giá 30 ngày
        </h2>
        {lowestNow ? (
          <span className="rounded-sm bg-ok-bg px-2 py-[3px] text-xs font-bold text-ok">Đang ở mức thấp nhất 30 ngày</span>
        ) : null}
      </div>
      <dl className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-muted">Hiện tại</dt>
          <dd className="font-bold text-brand">{formatVnd(currentPrice)}</dd>
        </div>
        <div>
          <dt className="text-muted">Thấp nhất</dt>
          <dd className="font-bold">{formatVnd(min)}</dd>
        </div>
        <div>
          <dt className="text-muted">Cao nhất</dt>
          <dd className="font-bold">{formatVnd(max)}</dd>
        </div>
      </dl>
      <figure
        className="flex flex-col gap-1"
        aria-label={`Biểu đồ giá từ ${formatShortDate(data[0].recordedAt)} đến ${formatShortDate(last.recordedAt)}, thấp nhất ${formatVnd(min)}, cao nhất ${formatVnd(max)}`}
      >
        <div className="relative h-44 pl-12 md:h-56" aria-hidden>
          {ticks.map((t) => (
            <div key={t} className="absolute right-0 left-0 flex -translate-y-1/2 items-center" style={{ top: `${y(t)}%` }}>
              <span className="w-12 pr-2 text-right text-xs text-muted tabular-nums">
                {formatShortVnd(Math.round(t / 1000) * 1000)}
              </span>
              <span className="flex-1 border-t border-dashed border-line" />
            </div>
          ))}
          <div className="relative h-full">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
              <path d={area} fill="var(--color-brand)" fillOpacity="0.08" />
              <path d={line} fill="none" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            <span
              className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand"
              style={{ left: `${x(data.length - 1)}%`, top: `${y(last.price)}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between pl-12 text-xs text-muted" aria-hidden>
          <span>{formatShortDate(data[0].recordedAt)}</span>
          <span>{formatShortDate(last.recordedAt)}</span>
        </div>
      </figure>
      <p className="text-xs text-muted">Giá ghi nhận mỗi ngày trên sàn, có thể chênh lệch theo phân loại và thời điểm.</p>
    </section>
  );
}
