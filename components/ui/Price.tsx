import { formatVnd } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Price({
  price,
  oldPrice,
  size = "md",
  className,
}: {
  price: number;
  oldPrice?: number | null;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("font-extrabold text-brand", size === "lg" ? "text-price" : "text-xl")}>
        {price > 0 ? formatVnd(price) : "Miễn phí"}
      </span>
      {oldPrice && oldPrice > price ? (
        <span className="text-[13px] text-subtle line-through">
          <span className="sr-only">Giá cũ </span>
          {formatVnd(oldPrice)}
        </span>
      ) : null}
    </div>
  );
}
