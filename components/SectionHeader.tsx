import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SectionHeader({ id, title, href, linkLabel = "Xem tất cả" }: { id: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 id={id} className="text-xl font-extrabold md:text-section">
        {title}
      </h2>
      {href ? (
        <Link href={href} className="inline-flex min-h-11 items-center gap-0.5 text-sm font-bold whitespace-nowrap text-brand hover:text-brand-hover">
          {linkLabel}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
