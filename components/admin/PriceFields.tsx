"use client";

import { useState } from "react";
import { Field, TextInput } from "@/components/admin/fields";
import { discountPercent } from "@/lib/format";

const toNumber = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;
const pretty = (s: string) => {
  const n = toNumber(s);
  return n ? n.toLocaleString("vi-VN") : "";
};

/** Giá mới + giá cũ, tự tính % giảm khi gõ. Gõ "1290000" sẽ hiện "1.290.000". */
export function PriceFields({ price, oldPrice, errors }: { price?: number; oldPrice?: number | null; errors?: Record<string, string> }) {
  const [p, setP] = useState(price ? price.toLocaleString("vi-VN") : "");
  const [o, setO] = useState(oldPrice ? oldPrice.toLocaleString("vi-VN") : "");
  const percent = discountPercent(toNumber(p), toNumber(o) || null);
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <Field label="Giá bán (đ)" htmlFor="price" error={errors?.price}>
        <TextInput id="price" name="price" inputMode="numeric" required value={p} onChange={(e) => setP(pretty(e.target.value))} error={errors?.price} />
      </Field>
      <Field label="Giá gốc (đ)" htmlFor="oldPrice" error={errors?.oldPrice}>
        <TextInput id="oldPrice" name="oldPrice" inputMode="numeric" value={o} onChange={(e) => setO(pretty(e.target.value))} error={errors?.oldPrice} />
      </Field>
      <div className="col-span-2 flex flex-col justify-end md:col-span-1">
        <p className="flex min-h-11 items-center rounded-lg bg-canvas px-3 text-sm" aria-live="polite">
          Giảm: <b className="ml-1 text-brand">{percent > 0 ? `${percent}%` : "—"}</b>
        </p>
      </div>
    </div>
  );
}
