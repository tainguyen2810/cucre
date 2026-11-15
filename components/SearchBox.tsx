import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

/** Ô tìm kiếm viền đỏ – gửi GET tới /tim-kiem?q= */
export function SearchBox({ className, defaultValue, id = "site-search" }: { className?: string; defaultValue?: string; id?: string }) {
  return (
    <form action="/tim-kiem" role="search" className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Tìm deal, mã giảm giá
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Tìm deal, mã giảm giá..."
        className="h-[46px] w-full rounded-lg border-2 border-brand bg-surface pr-12 pl-3.5 text-[15px] placeholder:text-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      />
      <button
        type="submit"
        className="absolute top-0 right-0 inline-flex size-[46px] items-center justify-center text-brand hover:text-brand-hover"
        aria-label="Tìm"
      >
        <Search className="size-5" aria-hidden />
      </button>
    </form>
  );
}
