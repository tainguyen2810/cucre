import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { StatusPill } from "@/components/admin/fields";
import { Flash } from "@/components/admin/Flash";
import { PLACE_TYPE_LABEL } from "@/components/PlaceCard";
import { LinkButton } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { param } from "@/lib/url";

export const metadata: Metadata = { title: "Quán đối tác" };

export default async function AdminPlacesPage({ searchParams }: PageProps<"/admin/places">) {
  await requireAdmin();
  const ok = param(await searchParams, "ok");
  const places = await db.place.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, type: true, district: true, status: true, commissionPercent: true, _count: { select: { vouchers: true } }, vouchers: { select: { _count: { select: { claims: true } } } } },
  });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Quán đối tác <span className="text-base font-semibold text-muted">({places.length})</span></h1>
        <LinkButton href="/admin/places/new"><Plus className="size-4" aria-hidden /> Thêm quán</LinkButton>
      </div>
      <Flash ok={ok} />
      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {places.map((p) => (
          <li key={p.id} className="flex flex-col gap-1 p-3">
            <Link href={`/admin/places/${p.id}`} className="font-semibold hover:text-brand">{p.name}</Link>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
              <StatusPill status={p.status} />
              <span>{PLACE_TYPE_LABEL[p.type]}</span>
              <span>{p.district}</span>
              <span>{p._count.vouchers} ưu đãi</span>
              <span>{p.vouchers.reduce((s, v) => s + v._count.claims, 0)} mã đã phát</span>
              {p.commissionPercent != null ? <span>CK {p.commissionPercent}%</span> : null}
            </p>
          </li>
        ))}
        {places.length === 0 ? <li className="p-6 text-center text-muted">Chưa có quán.</li> : null}
      </ul>
    </div>
  );
}
