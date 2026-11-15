import type { Metadata } from "next";
import Link from "next/link";
import { deleteSaleEvent } from "@/app/admin/(panel)/lich-sale/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { SaleEventForm } from "@/components/admin/SaleEventForm";
import { requireAdmin } from "@/lib/admin/auth";
import { toLocalInput } from "@/lib/admin/form";
import { db } from "@/lib/db";
import { param } from "@/lib/url";

export const metadata: Metadata = { title: "Lịch sale" };
const fmt = (d: Date) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(d);

export default async function SaleEventsPage({ searchParams }: PageProps<"/admin/lich-sale">) {
  await requireAdmin();
  const sp = await searchParams;
  const editId = Number(param(sp, "sua")) || null;
  const events = await db.saleEvent.findMany({ orderBy: { startsAt: "desc" }, take: 100 });
  const editing = editId ? events.find((e) => e.id === editId) : undefined;

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-extrabold">Lịch sale</h1>
        <Flash ok={param(sp, "ok")} />
        <p className="text-sm text-muted">Hiện ở trang Mã giảm giá các đợt sale trong 60 ngày tới.</p>
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {events.map((e) => (
            <li key={e.id} className="flex items-center gap-3 p-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/admin/lich-sale?sua=${e.id}`} className="font-semibold hover:text-brand">{e.name}</Link>
                <span className="text-[13px] text-muted">{fmt(e.startsAt)} → {fmt(e.endsAt)}</span>
              </div>
              <form action={deleteSaleEvent}>
                <input type="hidden" name="id" value={e.id} />
                <ConfirmButton />
              </form>
            </li>
          ))}
          {events.length === 0 ? <li className="p-6 text-center text-muted">Chưa có đợt sale.</li> : null}
        </ul>
      </div>
      <section className="flex flex-col gap-3 self-start rounded-xl border border-line bg-surface p-4">
        <h2 className="font-extrabold">{editing ? `Sửa: ${editing.name}` : "Thêm đợt sale"}</h2>
        <SaleEventForm
          key={editing?.id ?? "new"}
          values={editing ? { id: editing.id, name: editing.name, description: editing.description ?? "", startsAt: toLocalInput(editing.startsAt), endsAt: toLocalInput(editing.endsAt) } : { name: "", description: "", startsAt: "", endsAt: "" }}
        />
        {editing ? <Link href="/admin/lich-sale" className="text-sm text-muted hover:text-brand">Hủy sửa – thêm đợt mới</Link> : null}
      </section>
    </div>
  );
}
