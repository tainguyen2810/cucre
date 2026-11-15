import type { Metadata } from "next";
import { updateLead } from "@/app/admin/(panel)/hop-tac/actions";
import { Select, TextInput } from "@/components/admin/fields";
import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Đơn hợp tác" };
const LABEL = { new: "Mới", contacted: "Đã liên hệ", signed: "Đã ký", rejected: "Từ chối" } as const;
const fmt = (d: Date) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(d);

export default async function LeadsPage() {
  await requireAdmin();
  const leads = await db.partnerLead.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 200 });
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Đơn hợp tác <span className="text-base font-semibold text-muted">({leads.filter((l) => l.status === "new").length} mới)</span></h1>
      <ul className="flex flex-col gap-3">
        {leads.map((l) => (
          <li key={l.id} className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-bold">{l.placeName} <span className="font-normal text-muted">· {l.placeType}</span></p>
              <span className="text-[13px] text-muted">{fmt(l.createdAt)}</span>
            </div>
            <p className="text-sm">{l.address}</p>
            <p className="text-sm"><b>{l.contactName}</b> · <a href={`tel:${l.phone}`}>{l.phone}</a>{l.email ? ` · ${l.email}` : ""}</p>
            {l.proposedCommission ? <p className="text-sm">Chiết khấu đề xuất: <b>{l.proposedCommission}</b></p> : null}
            {l.offer ? <p className="rounded-md bg-canvas px-3 py-2 text-sm whitespace-pre-line">{l.offer}</p> : null}
            <form action={updateLead} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="id" value={l.id} />
              <label htmlFor={`st-${l.id}`} className="sr-only">Trạng thái</label>
              <Select id={`st-${l.id}`} name="status" defaultValue={l.status} className="w-40">
                {Object.entries(LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
              <label htmlFor={`note-${l.id}`} className="sr-only">Ghi chú</label>
              <TextInput id={`note-${l.id}`} name="note" defaultValue={l.note ?? ""} placeholder="Ghi chú nội bộ" className="min-w-0 flex-1" />
              <button type="submit" className="min-h-11 rounded-lg bg-ink px-4 text-sm font-bold text-white">Lưu</button>
            </form>
          </li>
        ))}
        {leads.length === 0 ? <li className="rounded-xl border border-line bg-surface p-6 text-center text-muted">Chưa có đơn.</li> : null}
      </ul>
    </div>
  );
}
