import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  page: number;
  totalPages: number;
  /** Đường dẫn gốc, vd "/gia-re" */
  basePath: string;
  /** Tham số lọc hiện tại, giữ nguyên khi chuyển trang */
  searchParams?: Record<string, string | undefined>;
};

function pageHref(basePath: string, params: Record<string, string | undefined>, page: number) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v && k !== "page") sp.set(k, v);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Danh sách số trang rút gọn: 1 … 4 5 6 … 12 */
function pageList(page: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  for (const [i, p] of sorted.entries()) {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  }
  return out;
}

const item = "inline-flex size-11 items-center justify-center rounded-lg border text-sm font-semibold";

export function Pagination({ page, totalPages, basePath, searchParams = {} }: Props) {
  if (totalPages <= 1) return null;
  const prev = page > 1 ? pageHref(basePath, searchParams, page - 1) : null;
  const next = page < totalPages ? pageHref(basePath, searchParams, page + 1) : null;

  return (
    <nav aria-label="Phân trang" className="flex flex-wrap items-center justify-center gap-2">
      {prev ? (
        <Link href={prev} rel="prev" className={cn(item, "border-line-strong bg-surface hover:border-ink")} aria-label="Trang trước">
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
      ) : null}
      {pageList(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-muted" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(basePath, searchParams, p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(item, p === page ? "border-ink bg-ink text-white" : "border-line-strong bg-surface hover:border-ink")}
          >
            {p}
          </Link>
        ),
      )}
      {next ? (
        <Link href={next} rel="next" className={cn(item, "border-line-strong bg-surface hover:border-ink")} aria-label="Trang sau">
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
