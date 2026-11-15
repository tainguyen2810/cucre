import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { Flash } from "@/components/admin/Flash";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/admin/auth";
import { signOut } from "@/lib/auth";
import { param } from "@/lib/url";

export const metadata: Metadata = { title: "Tài khoản" };

export default async function AccountPage({ searchParams }: PageProps<"/admin/tai-khoan">) {
  const user = await requireAdmin();
  const ok = param(await searchParams, "ok");
  return (
    <div className="flex max-w-md flex-col gap-5">
      <h1 className="text-2xl font-extrabold">Tài khoản</h1>
      <Flash ok={ok} />
      <p className="text-muted">Đang đăng nhập: <b className="text-ink">{user.email}</b></p>
      <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
        <h2 className="font-extrabold">Đổi mật khẩu</h2>
        <PasswordForm />
      </section>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/admin/login" });
        }}
      >
        <Button type="submit" variant="light"><LogOut className="size-4" aria-hidden /> Đăng xuất</Button>
      </form>
    </div>
  );
}
