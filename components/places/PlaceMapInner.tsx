"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

export type MapPin = { lat: number; lng: number; label: string; title: string; href?: string };

/** Bản đồ Leaflet + OpenStreetMap, mỗi quán là một nhãn giá */
export default function PlaceMapInner({ pins, zoom = 13, className }: { pins: MapPin[]; zoom?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || pins.length === 0) return;
    const map = L.map(ref.current, { scrollWheelZoom: false, attributionControl: true });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    }).addTo(map);

    const markers = pins.map((p) => {
      const icon = L.divIcon({
        className: "",
        html: `<span class="cucre-pin">${p.label.replace(/</g, "&lt;")}</span>`,
        iconSize: undefined,
        iconAnchor: [0, 0],
      });
      const m = L.marker([p.lat, p.lng], { icon, title: p.title, keyboard: true }).addTo(map);
      const safeTitle = p.title.replace(/</g, "&lt;");
      m.bindPopup(p.href ? `<a href="${p.href}" class="cucre-pin-link">${safeTitle}</a>` : safeTitle);
      return m;
    });

    if (pins.length === 1) map.setView([pins[0].lat, pins[0].lng], zoom);
    else map.fitBounds(L.featureGroup(markers).getBounds().pad(0.2));

    return () => {
      map.remove();
    };
  }, [pins, zoom]);

  return <div ref={ref} className={className} role="region" aria-label="Bản đồ quán" />;
}
