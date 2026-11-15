"use client";

import { savePlace } from "@/app/admin/(panel)/places/actions";
import { Field, Fieldset, Select, TextArea, TextInput } from "@/components/admin/fields";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { useFormAction } from "@/components/admin/useFormAction";
import type { FormState } from "@/lib/admin/form";
import { PLACE_TYPE_LABEL } from "@/components/PlaceCard";

export type PlaceFormValues = {
  id?: number; name: string; slug: string; type: string; address: string; district: string; ward: string; city: string;
  lat: string; lng: string; openingHours: string; description: string; commissionPercent: string; contact: string; status: string; images: string[];
};

export function PlaceForm({ values }: { values: PlaceFormValues }) {
  const { state, onSubmit, pending } = useFormAction<FormState>(savePlace, {});
  const e = state.errors ?? {};
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {state.message ? <p role="alert" className="rounded-lg bg-brand-soft px-3 py-2.5 text-sm font-semibold text-brand-hover">{state.message}</p> : null}
      <Fieldset legend="Thông tin quán">
        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <Field label="Tên quán" htmlFor="name" error={e.name}><TextInput id="name" name="name" required defaultValue={values.name} error={e.name} /></Field>
          <Field label="Loại hình" htmlFor="type">
            <Select id="type" name="type" defaultValue={values.type}>
              {Object.entries(PLACE_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Địa chỉ (số nhà, đường)" htmlFor="address" error={e.address}><TextInput id="address" name="address" required defaultValue={values.address} error={e.address} /></Field>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Field label="Phường/xã" htmlFor="ward"><TextInput id="ward" name="ward" defaultValue={values.ward} /></Field>
          <Field label="Quận/huyện" htmlFor="district" error={e.district} hint="VD: Bình Tân, Quận 3"><TextInput id="district" name="district" required defaultValue={values.district} error={e.district} /></Field>
          <Field label="Tỉnh/thành" htmlFor="city">
            <Select id="city" name="city" defaultValue={values.city}>
              {["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng"].map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vĩ độ (lat)" htmlFor="lat" error={e.lat} hint="Mẹo: dán nguyên “10.7496, 106.6110” từ Google Maps vào ô này">
            <TextInput id="lat" name="lat" inputMode="decimal" defaultValue={values.lat} error={e.lat} />
          </Field>
          <Field label="Kinh độ (lng)" htmlFor="lng" error={e.lng}><TextInput id="lng" name="lng" inputMode="decimal" defaultValue={values.lng} error={e.lng} /></Field>
        </div>
        <Field label="Giờ mở cửa" htmlFor="openingHours"><TextInput id="openingHours" name="openingHours" defaultValue={values.openingHours} placeholder="10:00 – 22:00" /></Field>
        <Field label="Ảnh quán" htmlFor="images"><ImageUploader name="images" initial={values.images} /></Field>
        <Field label="Giới thiệu" htmlFor="description"><TextArea id="description" name="description" rows={4} defaultValue={values.description} /></Field>
      </Fieldset>
      <Fieldset legend="Nội bộ (khách không thấy)">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Chiết khấu (%)" htmlFor="commissionPercent" error={e.commissionPercent}><TextInput id="commissionPercent" name="commissionPercent" inputMode="decimal" defaultValue={values.commissionPercent} /></Field>
          <Field label="Liên hệ chủ quán" htmlFor="contact" className="md:col-span-2"><TextInput id="contact" name="contact" defaultValue={values.contact} placeholder="Tên – SĐT" /></Field>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Trạng thái" htmlFor="status">
            <Select id="status" name="status" defaultValue={values.status}>
              <option value="published">Đang hiện</option>
              <option value="draft">Nháp</option>
              <option value="paused">Tạm dừng</option>
            </Select>
          </Field>
          <Field label="Đường dẫn (slug)" htmlFor="slug" hint="Để trống sẽ tự tạo từ tên + quận"><TextInput id="slug" name="slug" defaultValue={values.slug} /></Field>
        </div>
      </Fieldset>
      <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <SubmitButton pending={pending} className="flex-1 md:flex-none">{values.id ? "Lưu quán" : "Tạo quán"}</SubmitButton>
      </div>
    </form>
  );
}
