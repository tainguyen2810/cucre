"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV } from "@/lib/site";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Menu 7 mục: điện thoại là dải chip vuốt ngang, máy tính là hàng link. */
export function MainNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Danh mục chính" className="-mx-4 md:mx-0">
      <ul className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 md:gap-1 md:overflow-visible md:px-0 md:pb-0">
        {MAIN_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors",
                  "md:rounded-none md:border-0 md:border-b-2 md:px-3",
                  active
                    ? "border-ink bg-ink text-white md:border-brand md:bg-transparent md:text-brand"
                    : "border-line-strong bg-surface text-ink hover:border-ink md:border-transparent md:bg-transparent md:hover:text-brand",
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
