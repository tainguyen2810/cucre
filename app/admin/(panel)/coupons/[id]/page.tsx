import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteCoupon, duplicateCoupon } from "@/app/admin/(panel)/coupons/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CouponForm } from "@/components/admin/CouponForm";
import { StatusPill } from "@/components/admin/fields";
import { Flash } from "@/components/admin/Flash";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/admin/auth";
import { toLocalInput } from "@/lib/admin/form";
import { formOptions } from "@/lib/admin/options";
import { db } from "@/lib/db";
import { param } from "@/lib/url";

export const metadata: Metadata = { title: "Sửa mã giảm giá" };

export default async function EditCouponPage({ params, searchParams }: PageProps<"/admin/coupons/[id]">) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const c = await db.coupon.findUnique({ where: { id: Number(id) || 0 }, include: { _count: { select: { clicks: true } } } });
  if (!c) notFound();
  const options = await formOptions();
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link href="/admin/coupons" className="text-sm text-muted hover:text-brand">← Danh sách mã</Link>
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold">Sửa mã <StatusPill status={c.status} /></h1>
          <p className="text-sm text-muted">{c._count.clicks} lượt bấm ra sàn</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={duplicateCoupon}>
            <input type="hidden" name="id" value={c.id} />
            <Button type="submit" variant="light" size="sm">Nhân bản</Button>
          </form>
          <form action={deleteCoupon}>
            <input type="hidden" name="id" value={c.id} />
            <ConfirmButton />
          </form>
        </div>
      </div>
      <Flash ok={param(sp, "ok")} />
      <CouponForm
        key={c.updatedAt.toISOString()}
        options={options}
        values={{
          id: c.id,
          platformId: c.platformId,
          categoryId: c.categoryId,
          code: c.code ?? "",
          title: c.title,
          conditions: c.conditions ?? "",
          minOrder: c.minOrder,
          maxDiscount: c.maxDiscount,
          usedPercent: c.usedPercent,
          url: c.url,
          status: c.status,
          featured: c.featured,
          startsAt: toLocalInput(c.startsAt),
          expiresAt: toLocalInput(c.expiresAt),
        }}
      />
    </div>
  );
}
