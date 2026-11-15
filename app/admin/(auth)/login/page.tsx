import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { param } from "@/lib/url";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Đăng nhập quản trị", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if ((await auth())?.user) redirect("/admin");
  const callbackUrl = param(await searchParams, "callbackUrl");
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl border border-line bg-surface p-6">
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-extrabold">
            <span className="text-brand">cucre</span>.vn
          </p>
          <h1 className="text-muted">Đăng nhập trang quản trị</h1>
        </div>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
