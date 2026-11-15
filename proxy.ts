import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Chặn /admin khi chưa đăng nhập. Mỗi trang/Server Action trong admin vẫn phải tự kiểm tra auth().
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  if (!req.auth) {
    const url = new URL("/admin/login", req.nextUrl);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
