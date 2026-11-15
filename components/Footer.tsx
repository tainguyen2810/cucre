import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MAIN_NAV, SITE } from "@/lib/site";

const ABOUT_LINKS = [
  { href: "/hop-tac", label: "Hợp tác cho quán & spa" },
  { href: "/chinh-sach-bao-mat", label: "Chính sách bảo mật" },
  { href: "/blog", label: "Nên mua gì" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-site gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr] md:px-6">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-sm text-sm text-muted">
            {SITE.tagline}. Mã giảm giá, đồ công nghệ, phần mềm bản quyền, du lịch và ăn uống giá tốt mỗi ngày.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Danh mục</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm md:grid-cols-1">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-9 items-center hover:text-brand">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Về cucre.vn</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {ABOUT_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-9 items-center hover:text-brand">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-site flex-col gap-2 px-4 py-5 text-[13px] text-muted md:px-6">
          <p className="font-semibold text-ink">{SITE.disclosure}</p>
          <p>
            © {year} {SITE.company.name} · {SITE.company.city}
          </p>
        </div>
      </div>
    </footer>
  );
}
