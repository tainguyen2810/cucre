import type { Metadata } from "next";
import path from "node:path";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSetupToken, isInstalled, needsRestart } from "@/lib/install/state";
import { Wizard } from "./Wizard";

export const metadata: Metadata = { title: "Cài đặt cucre.vn", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if (isInstalled()) {
    if (!needsRestart()) redirect("/admin/login");
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-4 py-16">
        <h1 className="text-2xl font-extrabold">Đã lưu cấu hình</h1>
        <p className="text-muted">Web cần khởi động lại để nạp cấu hình mới. Nếu chạy bằng PM2, việc này tự động trong vài giây – tải lại trang. Nếu không, chạy <code>pm2 restart cucre</code>.</p>
      </main>
    );
  }

  const token = getSetupToken(); // tạo mã nếu chưa có (in ra log PM2)
  const verified = (await cookies()).get("cucre_setup")?.value === token;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "cucre.vn";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const cwd = process.cwd();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 md:py-12">
      <header className="flex flex-col gap-1">
        <p className="text-2xl font-extrabold"><span className="text-brand">cucre</span>.vn</p>
        <h1 className="text-[28px] leading-tight font-extrabold">Cài đặt website</h1>
        <p className="text-muted">Khoảng 5 phút. Bạn cần: thông tin database MySQL (tạo trong aaPanel), email và mật khẩu cho tài khoản quản trị.</p>
      </header>
      <Wizard tokenVerified={verified} appDir={cwd} defaults={{ siteUrl: `${proto}://${host}`, uploadDir: path.join(path.dirname(cwd), "cucre-uploads") }} />
    </main>
  );
}
