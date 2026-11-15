import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Lấy ảnh đầu tiên từ cột JSON images (string[]). */
export function firstImage(images: unknown): string | null {
  return Array.isArray(images) && typeof images[0] === "string" ? images[0] : null;
}

/** Khung ảnh tỉ lệ cố định; hiện ô trống khi chưa có ảnh. children = nhãn đặt chồng lên ảnh. */
export function ImageBox({
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 50vw, 280px",
  children,
}: {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden bg-placeholder", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-subtle" aria-hidden>
          <ImageIcon className="size-8" strokeWidth={1.5} />
        </div>
      )}
      {children}
    </div>
  );
}
