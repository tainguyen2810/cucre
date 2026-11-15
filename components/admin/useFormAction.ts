"use client";

import { useActionState, useTransition, type FormEvent } from "react";

/**
 * Gửi form qua Server Action mà KHÔNG để React xóa trắng form sau khi gửi
 * (mặc định React 19 reset form dùng prop action → người dùng mất dữ liệu khi báo lỗi).
 */
export function useFormAction<S>(action: (prev: Awaited<S>, formData: FormData) => Promise<S>, initial: Awaited<S>) {
  const [state, dispatch, actionPending] = useActionState<S, FormData>(action, initial);
  const [transitionPending, startTransition] = useTransition();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => dispatch(formData));
  };
  return { state, onSubmit, pending: actionPending || transitionPending };
}
