import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Select, StatusPill, TextInput } from "@/components/admin/fields";
import { Flash } from "@/components/admin/Flash";
import { LinkButton } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { formatShortDate } from "@/lib/format";
import { toSearchText } from "@/lib/slug";
import { pageParam, param } from "@/lib/url";

export const metadata: Metadata = { title: "Mã giảm giá" };
const PER_PAGE = 30;

export default async function AdminCouponsPage({ searchParams }: PageProps<"/admin/coupons">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = param(sp, "q");
  const status = param(sp, "trang-thai");
  const platform = param(sp, "san");
  const page = pageParam(sp);
  const where: Prisma.CouponWhereInput = {
    ...(q ? { OR: [{ titleSearch: { contains: toSearchText(q) } }, { code: { contains: q.toUpperCase() } }] } : {}),
    ...(status && ["pending", "published", "expired"].includes(status) ? { status: status as Prisma.EnumCouponStatusFilter["equals"] } : {}),
    ...(platform ? { platform: { slug: platform } } : {}),
  };
  const [total, coupons, platforms] = await Promise.all([
    db.coupon.count({ where }),
    db.coupon.findMany({ where, orderBy: { updatedAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { platform: { select: { name: true } }, _count: { select: { clicks: true } } } }),
    db.platform.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true, slug: true } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Mã giảm giá <span className="text-base font-semibold text-muted">({total})</span></h1>
        <LinkButton href="/admin/coupons/new"><Plus className="size-4" aria-hidden /> Thêm mã</LinkButton>
      </div>
      <Flash ok={param(sp, "ok")} />
      <form className="grid gap-2 md:grid-cols-[1fr_180px_180px_auto]" aria-label="Lọc mã">
        <label htmlFor="q" className="sr-only">Tìm theo tiêu đề hoặc mã</label>
        <TextInput id="q" name="q" type="search" defaultValue={q} placeholder="Tìm tiêu đề hoặc mã…" />
        <label htmlFor="trang-thai" className="sr-only">Trạng thái</label>
        <Select id="trang-thai" name="trang-thai" defaultValue={status ?? ""}>
          <option value="">Mọi trạng thái</option>
          <option value="published">Đang hiện</option>
          <option value="pending">Chờ duyệt</option>
          <option value="expired">Hết hạn</option>
        </Select>
        <label htmlFor="san" className="sr-only">Sàn</label>
        <Select id="san" name="san" defaultValue={platform ?? ""}>
          <option value="">Mọi sàn</option>
          {platforms.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </Select>
        <button type="submit" className="min-h-11 rounded-lg bg-ink px-4 text-sm font-bold text-white">Lọc</button>
      </form>
      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {coupons.map((c) => (
          <li key={c.id} className="flex flex-col gap-1 p-3">
            <Link href={`/admin/coupons/${c.id}`} className="font-semibold hover:text-brand">{c.title}</Link>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
              <StatusPill status={c.status} />
              <span>{c.platform.name}</span>
              {c.code ? <code className="rounded-sm bg-canvas px-1.5 font-mono font-bold text-ink">{c.code}</code> : <span>Không cần mã</span>}
              {c.expiresAt ? <span>HSD {formatShortDate(c.expiresAt)}</span> : null}
              <span>{c._count.clicks} click</span>
            </p>
          </li>
        ))}
        {coupons.length === 0 ? <li className="p-6 text-center text-muted">Không có mã nào.</li> : null}
      </ul>
      <Pagination page={page} totalPages={Math.max(1, Math.ceil(total / PER_PAGE))} basePath="/admin/coupons" searchParams={{ q, "trang-thai": status, san: platform }} />
    </div>
  );
}
