"use client";

import { saveVoucher } from "@/app/admin/(panel)/places/actions";
import { Field, Select, TextArea, TextInput } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { useFormAction } from "@/components/admin/useFormAction";
import type { FormState } from "@/lib/admin/form";

export type VoucherValues = { id?: number; title: string; price: string; oldPrice: string; conditions: string; quantity: string; status: string; startsAt: string; endsAt?: string; expiresAt: string };

export function VoucherForm({ placeId, values }: { placeId: number; values: VoucherValues }) {
  const { state, onSubmit, pending } = useFormAction<FormState>(saveVoucher, {});
  const e = state.errors ?? {};
  const p = values.id ? `v${values.id}-` : "vnew-";
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="placeId" value={placeId} />
      {values.id ? <input type="hidden" name="voucherId" value={values.id} /> : null}
      {state.message ? <p role="alert" className="text-sm font-semibold text-brand-hover">{state.message}</p> : null}
      <Field label="Tên ưu đãi" htmlFor={`${p}title`} error={e.title}><TextInput id={`${p}title`} name="title" required defaultValue={values.title} error={e.title} placeholder="VD: Buffet lẩu 2 người" /></Field>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Field label="Giá voucher (đ)" htmlFor={`${p}price`} hint="0 nếu là giảm %"><TextInput id={`${p}price`} name="price" inputMode="numeric" defaultValue={values.price} /></Field>
        <Field label="Giá gốc (đ)" htmlFor={`${p}oldPrice`}><TextInput id={`${p}oldPrice`} name="oldPrice" inputMode="numeric" defaultValue={values.oldPrice} /></Field>
        <Field label="Số lượng mã" htmlFor={`${p}quantity`} error={e.quantity} hint="Trống = không giới hạn"><TextInput id={`${p}quantity`} name="quantity" type="number" min={1} defaultValue={values.quantity} /></Field>
      </div>
      <Field label="Điều kiện" htmlFor={`${p}conditions`}><TextArea id={`${p}conditions`} name="conditions" rows={2} defaultValue={values.conditions} /></Field>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Trạng thái" htmlFor={`${p}status`}>
          <Select id={`${p}status`} name="status" defaultValue={values.status}>
            <option value="published">Đang chạy</option>
            <option value="draft">Nháp</option>
            <option value="paused">Tạm dừng</option>
            <option value="expired">Hết hạn</option>
          </Select>
        </Field>
        <Field label="Bắt đầu" htmlFor={`${p}startsAt`}><TextInput id={`${p}startsAt`} name="startsAt" type="datetime-local" defaultValue={values.startsAt} /></Field>
        <Field label="Hết hạn" htmlFor={`${p}expiresAt`}><TextInput id={`${p}expiresAt`} name="expiresAt" type="datetime-local" defaultValue={values.expiresAt} /></Field>
      </div>
      <SubmitButton pending={pending} variant={values.id ? "light" : "primary"} className="self-start">{values.id ? "Lưu ưu đãi" : "Thêm ưu đãi"}</SubmitButton>
    </form>
  );
}
