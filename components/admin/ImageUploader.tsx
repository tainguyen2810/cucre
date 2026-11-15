"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ImagePlus, X } from "lucide-react";

/** Upload nhiều ảnh lên /api/upload; danh sách URL gửi kèm form qua input ẩn name={name} (JSON). */
export function ImageUploader({ name, initial }: { name: string; initial: string[] }) {
  const [images, setImages] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    const added: string[] = [];
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.ok && data.url) added.push(data.url);
      else setError(data.error ?? "Upload lỗi");
    }
    setImages((prev) => [...prev, ...added]);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      <ul className="flex flex-wrap gap-2">
        {images.map((src, i) => (
          <li key={src} className="relative size-24 overflow-hidden rounded-lg border border-line bg-placeholder">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="size-full object-cover" />
            {i === 0 ? <span className="absolute bottom-1 left-1 rounded-sm bg-ink/80 px-1 text-[11px] font-semibold text-white">Ảnh chính</span> : null}
            <div className="absolute top-1 right-1 flex gap-1">
              {i > 0 ? (
                <button type="button" aria-label="Đặt làm ảnh chính" onClick={() => setImages((p) => [p[i], ...p.filter((_, k) => k !== i)])} className="inline-flex size-7 items-center justify-center rounded-full bg-surface/90">
                  <ArrowLeft className="size-3.5" aria-hidden />
                </button>
              ) : null}
              <button type="button" aria-label="Bỏ ảnh" onClick={() => setImages((p) => p.filter((_, k) => k !== i))} className="inline-flex size-7 items-center justify-center rounded-full bg-surface/90">
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          </li>
        ))}
        <li>
          <label className="flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line-strong text-xs font-semibold text-muted hover:border-ink">
            <ImagePlus className="size-5" aria-hidden />
            {busy ? "Đang tải…" : "Thêm ảnh"}
            <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" disabled={busy} onChange={(e) => upload(e.target.files)} />
          </label>
        </li>
      </ul>
      {error ? <p className="text-[13px] text-brand-hover">{error}</p> : <p className="text-[13px] text-muted">Ảnh tự thu nhỏ còn 1200px và chuyển sang WebP. Ảnh đầu tiên là ảnh chính.</p>}
    </div>
  );
}
