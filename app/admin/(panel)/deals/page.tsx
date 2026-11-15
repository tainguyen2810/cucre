import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { toggleDealFeatured } from "@/app/admin/(panel)/deals/actions";
import { Select, StatusPill, TextInput } from "@/components/admin/fields";
import { Flash } from "@/components/admin/Flash";
import { LinkButton } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { firstImage } from "@/components/ui/ImageBox";
import { requireAdmin } from "@/lib/admin/auth";
import { daysAgo } from "@/lib/dates";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { formatShortDate, formatVnd } from "@/lib/format";
import { SEGMENT_PAGE } from "@/lib/links";
import { toSearchText } from "@/lib/slug";
import { pageParam, param } from "@/lib/url";

export const metadata: Metadata = { title: "Deal" };
const PER_PAGE = 30;

export default async function AdminDealsPage({ searchParams }: PageProps<"/admin/deals">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = param(sp, "q");
  const status = param(sp, "trang-thai");
  const type = param(sp, "mang");
  const page = pageParam(sp);

  const where: Prisma.DealWhereInput = {
    ...(q ? { titleSearch: { contains: toSearchText(q) } } : {}),
    ...(status && ["draft", "pending", "published", "expired"].includes(status) ? { status: status as Prisma.EnumDealStatusFilter["equals"] } : {}),
    ...(type && ["product", "digital", "travel", "local"].includes(type) ? { type: type as Prisma.EnumSegmentFilter["equals"] } : {}),
  };
  const since = daysAgo(7);
  const [total, deals] = await Promise.all([
    db.deal.count({ where }),
    db.deal.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: { id: true, title: true, images: true, price: true, status: true, featured: true, type: true, expiresAt: true, platform: { select: { name: true } } },
    }),
  ]);
  const clicks = await db.click.groupBy({ by: ["dealId"], where: { dealId: { in: deals.map((d) => d.id) }, createdAt: { gte: since } }, _count: true });
  const clickOf = (id: number) => clicks.find((c) => c.dealId === id)?._count ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Deal <span className="text-base font-semibold text-muted">({total})</span></h1>
        <LinkButton href="/admin/deals/new">
          <Plus className="size-4" aria-hidden /> Thêm deal
        </LinkButton>
      </div>
      <Flash ok={param(sp, "ok")} />

      <form className="grid gap-2 md:grid-cols-[1fr_180px_180px_auto]" aria-label="Lọc deal">
        <label htmlFor="q" className="sr-only">Tìm theo tiêu đề</label>
        <TextInput id="q" name="q" type="search" defaultValue={q} placeholder="Tìm theo tiêu đề…" />
        <label htmlFor="trang-thai" className="sr-only">Trạng thái</label>
        <Select id="trang-thai" name="trang-thai" defaultValue={status ?? ""}>
          <option value="">Mọi trạng thái</option>
          <option value="published">Đang hiện</option>
          <option value="pending">Chờ duyệt</option>
          <option value="draft">Nháp</option>
          <option value="expired">Hết hạn</option>
        </Select>
        <label htmlFor="mang" className="sr-only">Mảng</label>
        <Select id="mang" name="mang" defaultValue={type ?? ""}>
          <option value="">Mọi mảng</option>
          {Object.entries(SEGMENT_PAGE).filter(([k]) => k !== "local").map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </Select>
        <button type="submit" className="min-h-11 rounded-lg bg-ink px-4 text-sm font-bold text-white">Lọc</button>
      </form>

      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {deals.map((d) => {
          const img = firstImage(d.images);
          return (
            <li key={d.id} className="flex items-center gap-3 p-3">
              <div className="size-14 shrink-0 overflow-hidden rounded-md bg-placeholder">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {img ? <img src={img} alt="" className="size-full object-cover" /> : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Link href={`/admin/deals/${d.id}`} className="line-clamp-2 font-semibold hover:text-brand">{d.title}</Link>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
                  <StatusPill status={d.status} />
                  <span>{d.platform.name}</span>
                  <span className="font-bold text-ink">{formatVnd(d.price)}</span>
                  {d.expiresAt ? <span>HSD {formatShortDate(d.expiresAt)}</span> : null}
                  <span>{clickOf(d.id)} click/7 ngày</span>
                </p>
              </div>
              <form action={toggleDealFeatured}>
                <input type="hidden" name="id" value={d.id} />
                <button
                  type="submit"
                  aria-label={d.featured ? "Bỏ nổi bật" : "Đặt nổi bật"}
                  aria-pressed={d.featured}
                  className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-canvas"
                >
                  <Star className={d.featured ? "size-5 fill-flash text-warn" : "size-5 text-subtle"} aria-hidden />
                </button>
              </form>
            </li>
          );
        })}
        {deals.length === 0 ? <li className="p-6 text-center text-muted">Không có deal nào.</li> : null}
      </ul>
      <Pagination page={page} totalPages={Math.max(1, Math.ceil(total / PER_PAGE))} basePath="/admin/deals" searchParams={{ q, "trang-thai": status, mang: type }} />
    </div>
  );
}
