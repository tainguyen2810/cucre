import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/admin/auth";
import { signOut } from "@/lib/auth";

export const metadata: Metadata = { title: { default: "Quản trị", template: "%s · Quản trị cucre.vn" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-site flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:gap-6 md:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin" className="text-xl font-extrabold whitespace-nowrap">
              <span className="text-brand">cucre</span>.vn <span className="text-sm font-semibold text-muted">quản trị</span>
            </Link>
            <div className="flex items-center gap-1 md:hidden">
              <Link href="/" target="_blank" className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-canvas" aria-label="Xem trang web">
                <ExternalLink className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
          <AdminNav />
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <span className="text-sm text-muted">{user.email}</span>
            <Link href="/" target="_blank" className="inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-semibold hover:bg-canvas">
              Xem web <ExternalLink className="size-3.5" aria-hidden />
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button type="submit" className="inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-semibold hover:bg-canvas">
                <LogOut className="size-4" aria-hidden /> Đăng xuất
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-site flex-1 px-4 py-6 md:px-6">{children}</main>
    </>
  );
}
