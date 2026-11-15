import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { deletePlace } from "@/app/admin/(panel)/places/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { StatusPill } from "@/components/admin/fields";
import { Flash } from "@/components/admin/Flash";
import { PlaceForm } from "@/components/admin/PlaceForm";
import { VoucherForm } from "@/components/admin/VoucherForm";
import { requireAdmin } from "@/lib/admin/auth";
import { toLocalInput } from "@/lib/admin/form";
import { db } from "@/lib/db";
import { placePath } from "@/lib/links";
import { param } from "@/lib/url";

export const metadata: Metadata = { title: "Sửa quán" };
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const vnd = (n: number | null) => (n ? n.toLocaleString("vi-VN") : "");

export default async function EditPlacePage({ params, searchParams }: PageProps<"/admin/places/[id]">) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const place = await db.place.findUnique({
    where: { id: Number(id) || 0 },
    include: { vouchers: { orderBy: { createdAt: "desc" }, include: { _count: { select: { claims: true } }, claims: { where: { status: "used" }, select: { id: true } } } } },
  });
  if (!place) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link href="/admin/places" className="text-sm text-muted hover:text-brand">← Danh sách quán</Link>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold">{place.name} <StatusPill status={place.status} /></h1>
        </div>
        <div className="flex gap-2">
          <Link href={placePath(place.slug)} target="_blank" className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-line-strong bg-surface px-3 text-sm font-bold hover:bg-canvas">
            Xem trang <ExternalLink className="size-3.5" aria-hidden />
          </Link>
          <form action={deletePlace}>
            <input type="hidden" name="id" value={place.id} />
            <ConfirmButton confirmLabel="Xóa cả ưu đãi và mã?" />
          </form>
        </div>
      </div>
      <Flash ok={param(sp, "ok")} />

      <section id="uu-dai" className="flex flex-col gap-3">
        <h2 className="text-xl font-extrabold">Ưu đãi (voucher)</h2>
        {place.vouchers.map((v) => (
          <details key={v.id} className="rounded-xl border border-line bg-surface p-4">
            <summary className="flex cursor-pointer flex-wrap items-center gap-2">
              <span className="font-bold">{v.title}</span>
              <StatusPill status={v.status} />
              <span className="text-[13px] text-muted">
                {v._count.claims}{v.quantity ? `/${v.quantity}` : ""} mã phát · {v.claims.length} đã dùng
              </span>
            </summary>
            <div className="mt-4">
              <VoucherForm
                key={v.updatedAt.toISOString()}
                placeId={place.id}
                values={{ id: v.id, title: v.title, price: vnd(v.price), oldPrice: vnd(v.oldPrice), conditions: v.conditions ?? "", quantity: v.quantity ? String(v.quantity) : "", status: v.status, startsAt: toLocalInput(v.startsAt), expiresAt: toLocalInput(v.expiresAt) }}
              />
            </div>
          </details>
        ))}
        <details className="rounded-xl border-2 border-dashed border-line-strong bg-surface p-4" open={place.vouchers.length === 0}>
          <summary className="cursor-pointer font-bold text-brand">+ Thêm ưu đãi mới</summary>
          <div className="mt-4">
            <VoucherForm placeId={place.id} values={{ title: "", price: "", oldPrice: "", conditions: "", quantity: "", status: "published", startsAt: "", expiresAt: "" }} />
          </div>
        </details>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-extrabold">Thông tin quán</h2>
        <PlaceForm
          key={place.updatedAt.toISOString()}
          values={{
            id: place.id, name: place.name, slug: place.slug, type: place.type, address: place.address, district: place.district, ward: place.ward ?? "", city: place.city,
            lat: place.lat != null ? String(place.lat) : "", lng: place.lng != null ? String(place.lng) : "", openingHours: place.openingHours ?? "", description: place.description ?? "",
            commissionPercent: place.commissionPercent != null ? String(place.commissionPercent) : "", contact: place.contact ?? "", status: place.status, images: strings(place.images),
          }}
        />
      </section>
    </div>
  );
}
