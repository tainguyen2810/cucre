"use client";

import Link from "next/link";
import Script from "next/script";
import { CircleCheck } from "lucide-react";
import { submitLead, type LeadState } from "@/app/(site)/hop-tac/actions";
import { useFormAction } from "@/components/admin/useFormAction";
import { Button } from "@/components/ui/Button";

const input = "min-h-12 w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] focus:border-ink focus:outline-none aria-[invalid=true]:border-brand";
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function F({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      {children}
      {error ? <p className="text-[13px] text-brand-hover">{error}</p> : null}
    </div>
  );
}

export function LeadForm() {
  const { state, onSubmit, pending } = useFormAction<LeadState>(submitLead, {});
  const e = state.errors ?? {};
  if (state.ok) {
    return (
      <div role="status" className="flex flex-col items-center gap-2 rounded-xl border border-line bg-ok-bg p-6 text-center text-ok">
        <CircleCheck className="size-8" aria-hidden />
        <p className="text-lg font-bold">Đã nhận đăng ký!</p>
        <p>cucre.vn sẽ gọi lại trong 1–2 ngày làm việc để trao đổi chi tiết.</p>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="relative flex flex-col gap-3" noValidate>
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="lead-website">Website</label>
        <input id="lead-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <F id="placeName" label="Tên quán / spa" error={e.placeName}><input id="placeName" name="placeName" required className={input} aria-invalid={e.placeName ? true : undefined} /></F>
        <F id="placeType" label="Loại hình" error={e.placeType}>
          <select id="placeType" name="placeType" required className={input} defaultValue="">
            <option value="" disabled>– Chọn –</option>
            {["Quán ăn / nhà hàng", "Buffet", "Cà phê / trà sữa", "Spa", "Massage", "Salon tóc / nail", "Khác"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </F>
      </div>
      <F id="address" label="Địa chỉ" error={e.address}><input id="address" name="address" required autoComplete="street-address" className={input} aria-invalid={e.address ? true : undefined} /></F>
      <div className="grid gap-3 sm:grid-cols-2">
        <F id="contactName" label="Người liên hệ" error={e.contactName}><input id="contactName" name="contactName" required autoComplete="name" className={input} aria-invalid={e.contactName ? true : undefined} /></F>
        <F id="phone" label="Số điện thoại" error={e.phone}><input id="phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" className={input} aria-invalid={e.phone ? true : undefined} /></F>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <F id="email" label="Email (không bắt buộc)" error={e.email}><input id="email" name="email" type="email" autoComplete="email" className={input} /></F>
        <F id="proposedCommission" label="Chiết khấu đề xuất" error={e.proposedCommission}><input id="proposedCommission" name="proposedCommission" placeholder="VD: 10% trên hóa đơn" className={input} /></F>
      </div>
      <F id="offer" label="Ưu đãi muốn chạy" error={e.offer}>
        <textarea id="offer" name="offer" rows={3} placeholder="VD: Buffet 2 người giảm 25%, áp dụng trưa các ngày trong tuần" className={`${input} py-2.5`} />
      </F>
      <label className="flex items-start gap-2 text-[13px] leading-snug">
        <input type="checkbox" name="consent" required className="mt-0.5 size-5 shrink-0 accent-brand" />
        <span>Tôi đồng ý để cucre.vn liên hệ qua số điện thoại/email trên, theo <Link href="/chinh-sach-bao-mat" target="_blank" className="font-semibold text-brand underline">Chính sách bảo mật</Link>.</span>
      </label>
      {e.consent ? <p className="text-[13px] text-brand-hover">{e.consent}</p> : null}
      {turnstileSiteKey ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-language="vi" />
        </>
      ) : null}
      {state.message ? <p role="alert" className="rounded-md bg-warn-bg px-3 py-2 text-sm text-warn">{state.message}</p> : null}
      <Button type="submit" disabled={pending} className="min-h-12 sm:self-start">{pending ? "Đang gửi…" : "Gửi đăng ký hợp tác"}</Button>
    </form>
  );
}
