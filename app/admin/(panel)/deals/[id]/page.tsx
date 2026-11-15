import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { deleteDeal, duplicateDeal } from "@/app/admin/(panel)/deals/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { DealForm } from "@/components/admin/DealForm";
import { StatusPill } from "@/components/admin/fields";
import { Flash } from "@/components/admin/Flash";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/admin/auth";
import { toLocalInput } from "@/lib/admin/form";
import { formOptions } from "@/lib/admin/options";
import { db } from "@/lib/db";
import { dealPath } from "@/lib/links";
import { param } from "@/lib/url";

export const metadata: Metadata = { title: "Sửa deal" };

const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

export default async function EditDealPage({ params, searchParams }: PageProps<"/admin/deals/[id]">) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const deal = await db.deal.findUnique({ where: { id: Number(id) || 0 }, include: { coupons: { select: { id: true } }, _count: { select: { clicks: true } } } });
  if (!deal) notFound();
  const options = await formOptions();

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link href="/admin/deals" className="text-sm text-muted hover:text-brand">
            ← Danh sách deal
          </Link>
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold">
            Sửa deal <StatusPill status={deal.status} />
          </h1>
          <p className="text-sm text-muted">{deal._count.clicks} lượt bấm ra sàn</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={dealPath(deal.slug)} target="_blank" className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-line-strong bg-surface px-3 text-sm font-bold hover:bg-canvas">
            Xem trang <ExternalLink className="size-3.5" aria-hidden />
          </Link>
          <form action={duplicateDeal}>
            <input type="hidden" name="id" value={deal.id} />
            <Button type="submit" variant="light" size="sm">
              Nhân bản
            </Button>
          </form>
          <form action={deleteDeal}>
            <input type="hidden" name="id" value={deal.id} />
            <ConfirmButton />
          </form>
        </div>
      </div>
      <Flash ok={param(sp, "ok")} />
      <DealForm
        key={deal.updatedAt.toISOString()}
        options={options}
        values={{
          id: deal.id,
          type: deal.type,
          title: deal.title,
          slug: deal.slug,
          platformId: deal.platformId,
          categoryId: deal.categoryId,
          price: deal.price,
          oldPrice: deal.oldPrice,
          affiliateUrl: deal.affiliateUrl,
          images: strings(deal.images),
          summary: deal.summary ?? "",
          description: deal.description ?? "",
          destination: deal.destination ?? "",
          techPros: strings(deal.techPros).join("\n"),
          techCons: strings(deal.techCons).join("\n"),
          techVerdict: deal.techVerdict ?? "",
          status: deal.status,
          featured: deal.featured,
          expiresAt: toLocalInput(deal.expiresAt),
          couponIds: deal.coupons.map((c) => c.id),
        }}
      />
    </div>
  );
}
