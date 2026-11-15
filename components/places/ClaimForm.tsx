"use client";

import Link from "next/link";
import Script from "next/script";
import { CircleCheck } from "lucide-react";
import { claimVoucher, type ClaimState } from "@/app/(site)/an-uong/actions";
import { useFormAction } from "@/components/admin/useFormAction";
import { Button } from "@/components/ui/Button";

const input = "min-h-12 w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] focus:border-ink focus:outline-none aria-[invalid=true]:border-brand";
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function ClaimForm({ voucherId, placeName }: { voucherId: number; placeName: string }) {
  const { state, onSubmit, pending } = useFormAction<ClaimState>(claimVoucher, {});
  const e = state.errors ?? {};

  if (state.ok && state.code) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-brand-line bg-brand-soft p-5 text-center">
        <CircleCheck className="size-8 text-ok" aria-hidden />
        <p className="font-bold">Nhận mã thành công!</p>
        <p className="font-mono text-3xl font-extrabold tracking-widest text-brand select-all">{state.code}</p>
        <p className="text-sm text-muted">Đưa mã này (hoặc đọc số điện thoại) cho nhân viên {placeName} khi thanh toán. Nên chụp màn hình để lưu lại.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
      <input type="hidden" name="voucherId" value={voucherId} />
      {/* Ô bẫy bot – người dùng không thấy */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`website-${voucherId}`}>Website</label>
        <input id={`website-${voucherId}`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`fullName-${voucherId}`} className="text-sm font-semibold">Họ tên</label>
        <input id={`fullName-${voucherId}`} name="fullName" autoComplete="name" required className={input} aria-invalid={e.fullName ? true : undefined} />
        {e.fullName ? <p className="text-[13px] text-brand-hover">{e.fullName}</p> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`phone-${voucherId}`} className="text-sm font-semibold">Số điện thoại</label>
        <input id={`phone-${voucherId}`} name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="0901 234 567" className={input} aria-invalid={e.phone ? true : undefined} />
        {e.phone ? <p className="text-[13px] text-brand-hover">{e.phone}</p> : null}
      </div>
      <label className="flex items-start gap-2 text-[13px] leading-snug">
        <input type="checkbox" name="consent" required className="mt-0.5 size-5 shrink-0 accent-brand" />
        <span>
          Tôi đồng ý cho cucre.vn và {placeName} dùng họ tên, số điện thoại để phát và xác nhận mã ưu đãi, theo{" "}
          <Link href="/chinh-sach-bao-mat" className="font-semibold text-brand underline" target="_blank">Chính sách bảo mật</Link>.
        </span>
      </label>
      {e.consent ? <p className="text-[13px] text-brand-hover">{e.consent}</p> : null}
      {turnstileSiteKey ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-language="vi" />
        </>
      ) : null}
      {state.message ? <p role="alert" className="rounded-md bg-warn-bg px-3 py-2 text-sm text-warn">{state.message}</p> : null}
      <Button type="submit" variant="outline" disabled={pending} className="min-h-12">
        {pending ? "Đang lấy mã…" : "Nhận voucher"}
      </Button>
    </form>
  );
}
