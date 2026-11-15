"use client";

import { useState } from "react";
import { saveDeal } from "@/app/admin/(panel)/deals/actions";
import { Field, Fieldset, Select, TextArea, TextInput } from "@/components/admin/fields";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { PriceFields } from "@/components/admin/PriceFields";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { useFormAction } from "@/components/admin/useFormAction";
import type { FormState } from "@/lib/admin/form";

export type DealFormValues = {
  id?: number;
  type: string;
  title: string;
  slug: string;
  platformId?: number;
  categoryId?: number | null;
  price?: number;
  oldPrice?: number | null;
  affiliateUrl: string;
  images: string[];
  summary: string;
  description: string;
  destination: string;
  techPros: string;
  techCons: string;
  techVerdict: string;
  status: string;
  featured: boolean;
  expiresAt: string;
  couponIds: number[];
};

type Options = {
  platforms: { id: number; name: string }[];
  categories: { id: number; name: string; segment: string; parentName: string | null }[];
  coupons: { id: number; label: string; platformId: number }[];
};

const TYPES = [
  { value: "product", label: "Giá rẻ (đồ công nghệ)" },
  { value: "digital", label: "Kỹ thuật số" },
  { value: "travel", label: "Du lịch" },
];

export function DealForm({ values, options }: { values: DealFormValues; options: Options }) {
  const { state, onSubmit, pending } = useFormAction<FormState>(saveDeal, {});
  const [type, setType] = useState(values.type);
  const [platformId, setPlatformId] = useState(values.platformId ? String(values.platformId) : "");
  const e = state.errors ?? {};
  const categories = options.categories.filter((c) => c.segment === type);
  const coupons = options.coupons.filter((c) => !platformId || c.platformId === Number(platformId) || values.couponIds.includes(c.id));

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {state.message ? (
        <p role="alert" className="rounded-lg bg-brand-soft px-3 py-2.5 text-sm font-semibold text-brand-hover">
          {state.message}
        </p>
      ) : null}

      <Fieldset legend="Thông tin chính">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Mảng" htmlFor="type">
            <Select id="type" name="type" value={type} onChange={(ev) => setType(ev.target.value)}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Sàn" htmlFor="platformId" error={e.platformId}>
            <Select id="platformId" name="platformId" required value={platformId} onChange={(ev) => setPlatformId(ev.target.value)}>
              <option value="">– Chọn sàn –</option>
              {options.platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Danh mục" htmlFor="categoryId">
            <Select id="categoryId" name="categoryId" defaultValue={values.categoryId ?? ""} key={type}>
              <option value="">– Không chọn –</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parentName ? `${c.parentName} › ${c.name}` : c.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Tiêu đề" htmlFor="title" error={e.title}>
          <TextInput id="title" name="title" required defaultValue={values.title} error={e.title} placeholder="VD: SSD NVMe 512GB Gen4 tốc độ 5000MB/s" />
        </Field>
        <PriceFields price={values.price} oldPrice={values.oldPrice} errors={e} />
        <Field label="Link affiliate" htmlFor="affiliateUrl" error={e.affiliateUrl} hint="Dán link đã tạo trên Shopee Affiliate / Accesstrade… Khách sẽ đi qua /go để ghi click.">
          <TextInput id="affiliateUrl" name="affiliateUrl" type="url" required defaultValue={values.affiliateUrl} error={e.affiliateUrl} placeholder="https://" />
        </Field>
        <Field label="Ảnh" htmlFor="images">
          <ImageUploader name="images" initial={values.images} />
        </Field>
        <Field label="Tóm tắt (hiện dưới tiêu đề, tối đa 500 ký tự)" htmlFor="summary" error={e.summary}>
          <TextArea id="summary" name="summary" rows={2} maxLength={500} defaultValue={values.summary} />
        </Field>
        {type === "travel" ? (
          <Field label="Điểm đến" htmlFor="destination">
            <TextInput id="destination" name="destination" defaultValue={values.destination} placeholder="VD: Đà Lạt" />
          </Field>
        ) : null}
      </Fieldset>

      <Fieldset legend="Đánh giá của kỹ thuật viên">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Điểm cộng (mỗi dòng một ý)" htmlFor="techPros">
            <TextArea id="techPros" name="techPros" rows={4} defaultValue={values.techPros} />
          </Field>
          <Field label="Lưu ý (mỗi dòng một ý)" htmlFor="techCons">
            <TextArea id="techCons" name="techCons" rows={4} defaultValue={values.techCons} />
          </Field>
        </div>
        <Field label="Kết luận (hiện trên thẻ deal: “KTV nhận xét”)" htmlFor="techVerdict">
          <TextArea id="techVerdict" name="techVerdict" rows={2} defaultValue={values.techVerdict} />
        </Field>
      </Fieldset>

      <Fieldset legend="Hiển thị">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Trạng thái" htmlFor="status">
            <Select id="status" name="status" defaultValue={values.status}>
              <option value="published">Đang hiện</option>
              <option value="draft">Nháp</option>
              <option value="pending">Chờ duyệt</option>
              <option value="expired">Hết hạn</option>
            </Select>
          </Field>
          <Field label="Hết hạn lúc" htmlFor="expiresAt" hint="Để trống nếu không có hạn">
            <TextInput id="expiresAt" name="expiresAt" type="datetime-local" defaultValue={values.expiresAt} />
          </Field>
          <label className="flex min-h-11 items-center gap-2 self-end text-sm font-semibold">
            <input type="checkbox" name="featured" defaultChecked={values.featured} className="size-5 accent-brand" />
            Nổi bật (hiện ở “Hot deal hôm nay”)
          </label>
        </div>
        {coupons.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-semibold">Mã dùng kèm</p>
            <div className="flex flex-col gap-1">
              {coupons.map((c) => (
                <label key={c.id} className="flex min-h-11 items-center gap-2 text-sm">
                  <input type="checkbox" name="couponIds" value={c.id} defaultChecked={values.couponIds.includes(c.id)} className="size-5 accent-brand" />
                  {c.label}
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </Fieldset>

      <details className="rounded-xl border border-line bg-surface p-4">
        <summary className="cursor-pointer font-bold">Nâng cao: mô tả chi tiết, đường dẫn</summary>
        <div className="mt-4 flex flex-col gap-3">
          <Field label="Mô tả chi tiết (cách đoạn bằng một dòng trống)" htmlFor="description">
            <TextArea id="description" name="description" rows={6} defaultValue={values.description} />
          </Field>
          <Field label="Đường dẫn (slug)" htmlFor="slug" hint="Để trống sẽ tự tạo từ tiêu đề. Đổi slug của deal đã đăng sẽ làm link cũ 404.">
            <TextInput id="slug" name="slug" defaultValue={values.slug} placeholder="tu-tao-tu-tieu-de" />
          </Field>
        </div>
      </details>

      <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <SubmitButton pending={pending} className="flex-1 md:flex-none">{values.id ? "Lưu thay đổi" : "Tạo deal"}</SubmitButton>
      </div>
    </form>
  );
}
