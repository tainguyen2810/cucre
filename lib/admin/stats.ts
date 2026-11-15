import "server-only";
import { db } from "@/lib/db";
import { daysAgo, vnDay } from "@/lib/dates";
import { activeCouponWhere } from "@/lib/queries/coupons";
import { activeDealWhere } from "@/lib/queries/deals";

type DayRow = { d: string | Date; clicks: bigint; people: bigint };
type PlatformRow = { name: string; clicks: bigint; people: bigint };

/** Lượt bấm và số người bấm (theo mã băm IP/ngày) cho n ngày gần nhất, đủ cả ngày không có click. */
export async function clicksByDay(days = 14) {
  const since = daysAgo(days - 1);
  since.setUTCHours(0, 0, 0, 0);
  const rows = await db.$queryRaw<DayRow[]>`
    SELECT DATE(DATE_ADD(createdAt, INTERVAL 7 HOUR)) AS d, COUNT(*) AS clicks, COUNT(DISTINCT ipHash) AS people
    FROM Click WHERE createdAt >= ${since}
    GROUP BY d ORDER BY d`;
  const map = new Map(rows.map((r) => [typeof r.d === "string" ? r.d.slice(0, 10) : r.d.toISOString().slice(0, 10), r]));
  return Array.from({ length: days }, (_, i) => {
    const day = vnDay(daysAgo(days - 1 - i));
    const r = map.get(day);
    return { day, clicks: Number(r?.clicks ?? 0), people: Number(r?.people ?? 0) };
  });
}

export async function clicksByPlatform(days = 7) {
  const rows = await db.$queryRaw<PlatformRow[]>`
    SELECT p.name AS name, COUNT(*) AS clicks, COUNT(DISTINCT c.ipHash) AS people
    FROM Click c JOIN Platform p ON p.id = c.platformId
    WHERE c.createdAt >= ${daysAgo(days)}
    GROUP BY p.id, p.name ORDER BY clicks DESC`;
  return rows.map((r) => ({ name: r.name, clicks: Number(r.clicks), people: Number(r.people) }));
}

export async function topDeals(days = 7, take = 10) {
  const groups = await db.click.groupBy({
    by: ["dealId"],
    where: { dealId: { not: null }, createdAt: { gte: daysAgo(days) } },
    _count: { _all: true },
    orderBy: { _count: { dealId: "desc" } },
    take,
  });
  const deals = await db.deal.findMany({ where: { id: { in: groups.map((g) => g.dealId!) } }, select: { id: true, title: true, platform: { select: { name: true } } } });
  return groups.map((g) => ({ ...deals.find((d) => d.id === g.dealId)!, clicks: g._count._all })).filter((d) => d.title);
}

export async function overviewCounts() {
  const today = new Date(`${vnDay(new Date())}T00:00:00+07:00`);
  const [activeDeals, pendingDeals, activeCoupons, pendingCoupons, clicksToday, newLeads, claimsToday] = await Promise.all([
    db.deal.count({ where: activeDealWhere() }),
    db.deal.count({ where: { status: "pending" } }),
    db.coupon.count({ where: activeCouponWhere() }),
    db.coupon.count({ where: { status: "pending" } }),
    db.click.count({ where: { createdAt: { gte: today } } }),
    db.partnerLead.count({ where: { status: "new" } }),
    db.voucherClaim.count({ where: { createdAt: { gte: today } } }),
  ]);
  return { activeDeals, pendingDeals, activeCoupons, pendingCoupons, clicksToday, newLeads, claimsToday };
}
