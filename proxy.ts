import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { isInstalled } from "@/lib/install/state";

// 1) Chưa cài đặt (chưa có .env) → mọi trang chuyển sang wizard /cai-dat.
// 2) Đã cài → chặn /admin khi chưa đăng nhập. Mỗi trang/Server Action admin vẫn tự kiểm tra auth().

const adminGuard = auth((req) => {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  if (!req.auth) {
    const url = new URL("/admin/login", req.nextUrl);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export function proxy(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;
  const installing = pathname === "/cai-dat" || pathname.startsWith("/cai-dat/");

  if (!isInstalled()) {
    if (installing || pathname === "/api/health") return NextResponse.next();
    return NextResponse.redirect(new URL("/cai-dat", req.nextUrl));
  }
  if (pathname.startsWith("/admin")) {
    return (adminGuard as unknown as (r: NextRequest, e: NextFetchEvent) => Promise<Response> | Response)(req, event);
  }
  return NextResponse.next();
}

export const config = {
  // Bỏ qua file tĩnh của Next.js, ảnh upload và favicon
  matcher: ["/((?!_next/static|_next/image|uploads/|favicon.ico).*)"],
};
