"use client";

import { savePost } from "@/app/admin/(panel)/posts/actions";
import { Field, Fieldset, Select, TextArea, TextInput } from "@/components/admin/fields";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { useFormAction } from "@/components/admin/useFormAction";
import type { FormState } from "@/lib/admin/form";

export type PostFormValues = {
  id?: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  relatedDeals: string;
  status: string;
  publishedAt: string;
};

export function PostForm({ values, categories }: { values: PostFormValues; categories: string[] }) {
  const { state, onSubmit, pending } = useFormAction<FormState>(savePost, {});
  const e = state.errors ?? {};
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {state.message ? <p role="alert" className="rounded-lg bg-brand-soft px-3 py-2.5 text-sm font-semibold text-brand-hover">{state.message}</p> : null}
      <Fieldset legend="Bài viết">
        <Field label="Tiêu đề" htmlFor="title" error={e.title}>
          <TextInput id="title" name="title" required defaultValue={values.title} error={e.title} />
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Chuyên mục" htmlFor="category" error={e.category} hint="Chọn có sẵn hoặc gõ chuyên mục mới">
            <TextInput id="category" name="category" required list="post-categories" defaultValue={values.category} error={e.category} />
            <datalist id="post-categories">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </Field>
          <Field label="Đường dẫn (slug)" htmlFor="slug" hint="Để trống sẽ tự tạo từ tiêu đề">
            <TextInput id="slug" name="slug" defaultValue={values.slug} />
          </Field>
        </div>
        <Field label="Mô tả ngắn (hiện ở danh sách và Google)" htmlFor="excerpt" error={e.excerpt}>
          <TextArea id="excerpt" name="excerpt" rows={2} maxLength={500} defaultValue={values.excerpt} />
        </Field>
        <Field label="Ảnh bìa" htmlFor="coverImage">
          <ImageUploader name="coverImage" initial={values.coverImage ? [values.coverImage] : []} />
        </Field>
        <Field
          label="Nội dung (Markdown)"
          htmlFor="content"
          error={e.content}
          hint="## Tiêu đề mục (tự vào mục lục) · **đậm** · - gạch đầu dòng · [chữ](link). Chèn thẻ deal: một dòng riêng {{deal:slug-cua-deal}}"
        >
          <TextArea id="content" name="content" rows={18} required defaultValue={values.content} className="font-mono text-sm" />
        </Field>
        <Field label="Deal liên quan (cuối bài)" htmlFor="relatedDeals" hint="Mỗi dòng một slug hoặc link trang deal">
          <TextArea id="relatedDeals" name="relatedDeals" rows={3} defaultValue={values.relatedDeals} />
        </Field>
      </Fieldset>
      <Fieldset legend="Đăng bài">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Trạng thái" htmlFor="status">
            <Select id="status" name="status" defaultValue={values.status}>
              <option value="draft">Nháp</option>
              <option value="published">Đăng</option>
            </Select>
          </Field>
          <Field label="Ngày đăng" htmlFor="publishedAt" hint="Để trống = đăng ngay. Ngày tương lai = hẹn giờ đăng">
            <TextInput id="publishedAt" name="publishedAt" type="datetime-local" defaultValue={values.publishedAt} />
          </Field>
        </div>
      </Fieldset>
      <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <SubmitButton pending={pending} className="flex-1 md:flex-none">{values.id ? "Lưu bài" : "Tạo bài"}</SubmitButton>
      </div>
    </form>
  );
}
