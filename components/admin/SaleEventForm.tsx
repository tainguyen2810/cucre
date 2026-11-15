"use client";

import { saveSaleEvent } from "@/app/admin/(panel)/lich-sale/actions";
import { Field, TextInput } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { useFormAction } from "@/components/admin/useFormAction";
import type { FormState } from "@/lib/admin/form";

export type SaleEventValues = { id?: number; name: string; description: string; startsAt: string; endsAt: string };

export function SaleEventForm({ values }: { values: SaleEventValues }) {
  const { state, onSubmit, pending } = useFormAction<FormState>(saveSaleEvent, {});
  const e = state.errors ?? {};
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <Field label="Tên đợt sale" htmlFor="name" error={e.name}>
        <TextInput id="name" name="name" required defaultValue={values.name} error={e.name} placeholder="VD: Sale 12.12" />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Bắt đầu" htmlFor="startsAt" error={e.startsAt}>
          <TextInput id="startsAt" name="startsAt" type="datetime-local" required defaultValue={values.startsAt} error={e.startsAt} />
        </Field>
        <Field label="Kết thúc" htmlFor="endsAt" error={e.endsAt}>
          <TextInput id="endsAt" name="endsAt" type="datetime-local" required defaultValue={values.endsAt} error={e.endsAt} />
        </Field>
      </div>
      <Field label="Ghi chú ngắn" htmlFor="description">
        <TextInput id="description" name="description" defaultValue={values.description} placeholder="VD: Siêu sale trên Shopee, Lazada" />
      </Field>
      <SubmitButton pending={pending} className="self-start">{values.id ? "Lưu" : "Thêm đợt sale"}</SubmitButton>
    </form>
  );
}
