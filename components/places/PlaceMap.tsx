"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "./PlaceMapInner";

// Leaflet cần window → chỉ tải ở trình duyệt
const Inner = dynamic(() => import("./PlaceMapInner"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-placeholder" />,
});

export type { MapPin };

export function PlaceMap({ pins, zoom, className }: { pins: MapPin[]; zoom?: number; className?: string }) {
  if (pins.length === 0) return null;
  return (
    <div className={className}>
      <Inner pins={pins} zoom={zoom} className="h-full w-full" />
    </div>
  );
}
