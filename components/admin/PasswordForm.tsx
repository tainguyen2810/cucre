"use client";

import { changePassword } from "@/app/admin/(panel)/tai-khoan/actions";
import { Field, TextInput } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { useFormAction } from "@/components/admin/useFormAction";
import type { FormState } from "@/lib/admin/form";

export function PasswordForm() {
  const { state, onSubmit, pending } = useFormAction<FormState>(changePassword, {});
  const e = state.errors ?? {};
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <Field label="Mật khẩu hiện tại" htmlFor="current" error={e.current}>
        <TextInput id="current" name="current" type="password" autoComplete="current-password" required error={e.current} />
      </Field>
      <Field label="Mật khẩu mới (tối thiểu 10 ký tự)" htmlFor="next" error={e.next}>
        <TextInput id="next" name="next" type="password" autoComplete="new-password" required minLength={10} error={e.next} />
      </Field>
      <Field label="Nhập lại mật khẩu mới" htmlFor="confirm" error={e.confirm}>
        <TextInput id="confirm" name="confirm" type="password" autoComplete="new-password" required error={e.confirm} />
      </Field>
      <SubmitButton pending={pending} className="self-start">Đổi mật khẩu</SubmitButton>
    </form>
  );
}
