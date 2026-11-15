"use client";

import { saveCoupon } from "@/app/admin/(panel)/coupons/actions";
import { Field, Fieldset, Select, TextArea, TextInput } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { useFormAction } from "@/components/admin/useFormAction";
import type { FormState } from "@/lib/admin/form";

export type CouponFormValues = {
  id?: number;
  platformId?: number;
  categoryId?: number | null;
  code: string;
  title: string;
  conditions: string;
  minOrder?: number | null;
  maxDiscount?: number | null;
  usedPercent: number;
  url: string;
  status: string;
  featured: boolean;
  startsAt: string;
  expiresAt: string;
};

type Options = {
  platforms: { id: number; name: string }[];
  categories: { id: number; name: string; parentName: string | null }[];
};

const vnd = (n?: number | null) => (n ? n.toLocaleString("vi-VN") : "");

export function CouponForm({ values, options }: { values: CouponFormValues; options: Options }) {
  const { state, onSubmit, pending } = useFormAction<FormState>(saveCoupon, {});
  const e = state.errors ?? {};
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {state.message ? (
        <p role="alert" className="rounded-lg bg-brand-soft px-3 py-2.5 text-sm font-semibold text-brand-hover">
          {state.message}
        </p>
      ) : null}
      <Fieldset legend="Mã giảm giá">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Sàn" htmlFor="platformId" error={e.platformId}>
            <Select id="platformId" name="platformId" required defaultValue={values.platformId ?? ""}>
              <option value="">– Chọn sàn –</option>
              {options.platforms.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Ngành" htmlFor="categoryId">
            <Select id="categoryId" name="categoryId" defaultValue={values.categoryId ?? ""}>
              <option value="">– Mọi ngành –</option>
              {options.categories.map((c) => (
                <option key={c.id} value={c.id}>{c.parentName ? `${c.parentName} › ${c.name}` : c.name}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Tiêu đề" htmlFor="title" error={e.title}>
          <TextInput id="title" name="title" required defaultValue={values.title} error={e.title} placeholder="VD: Giảm 50.000đ cho đơn từ 300.000đ" />
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Mã" htmlFor="code" error={e.code} hint="Để trống nếu ưu đãi không cần mã">
            <TextInput id="code" name="code" defaultValue={values.code} className="font-mono uppercase" autoCapitalize="characters" />
          </Field>
          <Field label="Link (affiliate)" htmlFor="url" error={e.url}>
            <TextInput id="url" name="url" type="url" required defaultValue={values.url} error={e.url} placeholder="https://" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Field label="Đơn tối thiểu (đ)" htmlFor="minOrder">
            <TextInput id="minOrder" name="minOrder" inputMode="numeric" defaultValue={vnd(values.minOrder)} />
          </Field>
          <Field label="Giảm tối đa (đ)" htmlFor="maxDiscount">
            <TextInput id="maxDiscount" name="maxDiscount" inputMode="numeric" defaultValue={vnd(values.maxDiscount)} />
          </Field>
          <Field label="Đã dùng (%)" htmlFor="usedPercent" error={e.usedPercent}>
            <TextInput id="usedPercent" name="usedPercent" type="number" min={0} max={100} defaultValue={values.usedPercent} />
          </Field>
        </div>
        <Field label="Điều kiện" htmlFor="conditions">
          <TextArea id="conditions" name="conditions" rows={3} defaultValue={values.conditions} />
        </Field>
      </Fieldset>
      <Fieldset legend="Hiển thị">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Trạng thái" htmlFor="status">
            <Select id="status" name="status" defaultValue={values.status}>
              <option value="published">Đang hiện</option>
              <option value="pending">Chờ duyệt</option>
              <option value="expired">Hết hạn</option>
            </Select>
          </Field>
          <Field label="Bắt đầu" htmlFor="startsAt">
            <TextInput id="startsAt" name="startsAt" type="datetime-local" defaultValue={values.startsAt} />
          </Field>
          <Field label="Hết hạn" htmlFor="expiresAt">
            <TextInput id="expiresAt" name="expiresAt" type="datetime-local" defaultValue={values.expiresAt} />
          </Field>
        </div>
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="featured" defaultChecked={values.featured} className="size-5 accent-brand" />
          Nổi bật (ưu tiên hiện đầu danh sách và trang chủ)
        </label>
      </Fieldset>
      <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <SubmitButton pending={pending} className="flex-1 md:flex-none">{values.id ? "Lưu thay đổi" : "Tạo mã"}</SubmitButton>
      </div>
    </form>
  );
}
