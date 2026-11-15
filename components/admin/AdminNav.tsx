"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export const ADMIN_NAV = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/deals", label: "Deal" },
  { href: "/admin/coupons", label: "Mã giảm giá" },
  { href: "/admin/posts", label: "Bài viết" },
  { href: "/admin/lich-sale", label: "Lịch sale" },
  { href: "/admin/places", label: "Quán" },
  { href: "/admin/nhan-ma", label: "Khách nhận mã" },
  { href: "/admin/doi-soat", label: "Đối soát" },
  { href: "/admin/hop-tac", label: "Hợp tác" },
  { href: "/admin/tai-khoan", label: "Tài khoản" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Quản trị" className="-mx-4 md:mx-0">
      <ul className="no-scrollbar flex gap-1 overflow-x-auto px-4 md:px-0">
        {ADMIN_NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold whitespace-nowrap",
                  active ? "bg-ink text-white" : "text-ink hover:bg-canvas",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
