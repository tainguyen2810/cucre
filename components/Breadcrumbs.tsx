import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";

export type Crumb = { label: string; href?: string };

/** Đường dẫn phân cấp + JSON-LD BreadcrumbList */
export function Breadcrumbs({ items, siteUrl }: { items: Crumb[]; siteUrl: string }) {
  const all: Crumb[] = [{ label: "Trang chủ", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Đường dẫn" className="text-[13px] text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          {all.map((c, i) => (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1">
              {i > 0 ? <ChevronRight className="size-3.5" aria-hidden /> : null}
              {c.href && i < all.length - 1 ? (
                <Link href={c.href} className="hover:text-brand">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={i === all.length - 1 ? "page" : undefined} className="line-clamp-1 text-ink">
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            ...(c.href ? { item: new URL(c.href, siteUrl).toString() } : {}),
          })),
        }}
      />
    </>
  );
}
