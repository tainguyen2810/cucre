import type { Metadata } from "next";
import { setClaimStatus } from "@/app/admin/(panel)/nhan-ma/actions";
import { Select, TextInput } from "@/components/admin/fields";
import { Pagination } from "@/components/ui/Pagination";
import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/cn";
import { pageParam, param } from "@/lib/url";

export const metadata: Metadata = { title: "Khách nhận mã" };
const PER_PAGE = 50;
const fmt = (d: Date) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(d);
const STATUS = { issued: { label: "Chưa dùng", tone: "bg-info-bg text-info" }, used: { label: "Đã dùng", tone: "bg-ok-bg text-ok" }, cancelled: { label: "Đã hủy", tone: "bg-placeholder text-muted" } } as const;

export default async function ClaimsPage({ searchParams }: PageProps<"/admin/nhan-ma">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = param(sp, "q");
  const status = param(sp, "trang-thai");
  const placeId = Number(param(sp, "quan")) || undefined;
  const page = pageParam(sp);
  const digits = q?.replace(/\D/g, "");
  const where: Prisma.VoucherClaimWhereInput = {
    ...(q ? { OR: [{ code: { contains: q.toUpperCase().replace(/\s/g, "") } }, ...(digits && digits.length >= 3 ? [{ phone: { contains: digits } }] : []), { fullName: { contains: q } }] } : {}),
    ...(status && status in STATUS ? { status: status as keyof typeof STATUS } : {}),
    ...(placeId ? { voucher: { placeId } } : {}),
  };
  const [total, claims, places] = await Promise.all([
    db.voucherClaim.count({ where }),
    db.voucherClaim.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { voucher: { select: { title: true, place: { select: { name: true } } } } } }),
    db.place.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Khách nhận mã <span className="text-base font-semibold text-muted">({total})</span></h1>
      <p className="text-sm text-muted">Dữ liệu cá nhân – chỉ dùng để xác nhận mã với quán. Khi quán gọi hỏi, tra theo mã hoặc số điện thoại rồi bấm “Đã dùng”.</p>
      <form className="grid gap-2 md:grid-cols-[1fr_180px_220px_auto]" aria-label="Tra mã">
        <label htmlFor="q" className="sr-only">Mã, SĐT hoặc tên</label>
        <TextInput id="q" name="q" type="search" defaultValue={q} placeholder="Tra mã (CR...), SĐT hoặc tên" autoFocus />
        <label htmlFor="trang-thai" className="sr-only">Trạng thái</label>
        <Select id="trang-thai" name="trang-thai" defaultValue={status ?? ""}>
          <option value="">Mọi trạng thái</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </Select>
        <label htmlFor="quan" className="sr-only">Quán</label>
        <Select id="quan" name="quan" defaultValue={placeId ?? ""}>
          <option value="">Mọi quán</option>
          {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <button type="submit" className="min-h-11 rounded-lg bg-ink px-4 text-sm font-bold text-white">Tra</button>
      </form>
      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {claims.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-3 p-3">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="flex flex-wrap items-center gap-2">
                <code className="font-mono text-base font-extrabold">{c.code}</code>
                <span className={cn("rounded-sm px-2 py-0.5 text-xs font-bold", STATUS[c.status].tone)}>{STATUS[c.status].label}</span>
              </p>
              <p className="text-sm"><b>{c.fullName}</b> · <a href={`tel:${c.phone}`} className="tabular-nums">{c.phone}</a></p>
              <p className="text-[13px] text-muted">{c.voucher.place.name} – {c.voucher.title} · nhận {fmt(c.createdAt)}{c.usedAt ? ` · dùng ${fmt(c.usedAt)}` : ""}</p>
            </div>
            <div className="flex gap-2">
              {c.status === "issued" ? (
                <>
                  <form action={setClaimStatus}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="status" value="used" /><button className="min-h-11 rounded-lg bg-ok px-3 text-sm font-bold text-white">Đã dùng</button></form>
                  <form action={setClaimStatus}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="status" value="cancelled" /><button className="min-h-11 rounded-lg border border-line-strong px-3 text-sm font-bold">Hủy</button></form>
                </>
              ) : (
                <form action={setClaimStatus}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="status" value="issued" /><button className="min-h-11 rounded-lg border border-line-strong px-3 text-sm font-semibold text-muted">Hoàn tác</button></form>
              )}
            </div>
          </li>
        ))}
        {claims.length === 0 ? <li className="p-6 text-center text-muted">Không có mã phù hợp.</li> : null}
      </ul>
      <Pagination page={page} totalPages={Math.max(1, Math.ceil(total / PER_PAGE))} basePath="/admin/nhan-ma" searchParams={{ q, "trang-thai": status, quan: placeId ? String(placeId) : undefined }} />
    </div>
  );
}
