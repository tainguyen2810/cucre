"use client";

import { useFormAction } from "@/components/admin/useFormAction";
import { Button } from "@/components/ui/Button";
import { login, type LoginState } from "./actions";

const input = "h-12 w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] focus:border-ink focus:outline-none";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const { state, onSubmit, pending } = useFormAction<LoginState>(login, {});
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/admin"} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className={input} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold">
          Mật khẩu
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} className={input} />
      </div>
      {state.error ? (
        <p role="alert" className="rounded-md bg-brand-soft px-3 py-2 text-sm text-brand-hover">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="min-h-12">
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>
    </form>
  );
}
