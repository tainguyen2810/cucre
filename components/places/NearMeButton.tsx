"use client";

import { LocateFixed } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { chipClass } from "@/components/ui/Chip";

/** Lấy vị trí trình duyệt rồi thêm ?gan=lat,lng để sắp xếp quán gần nhất (vị trí không được lưu). */
export function NearMeButton({ active }: { active: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  function go(value?: string) {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set("gan", value);
    else sp.delete("gan");
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  if (active) {
    return (
      <button type="button" className={chipClass(true)} onClick={() => go()} aria-pressed="true">
        <LocateFixed className="mr-1.5 size-4" aria-hidden /> Gần tôi
      </button>
    );
  }
  return (
    <button
      type="button"
      className={chipClass(false)}
      aria-pressed="false"
      disabled={state === "loading"}
      onClick={() => {
        if (!navigator.geolocation) return setState("error");
        setState("loading");
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setState("idle");
            go(`${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`);
          },
          () => setState("error"),
          { timeout: 10000, maximumAge: 300000 },
        );
      }}
    >
      <LocateFixed className="mr-1.5 size-4" aria-hidden />
      {state === "loading" ? "Đang lấy vị trí…" : state === "error" ? "Không lấy được vị trí" : "Gần tôi nhất"}
    </button>
  );
}
