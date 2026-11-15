import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { RegionValue } from "@/lib/site";

/** Khu vực (cookie) → tên thành phố trong cột Place.city */
export const REGION_CITY: Record<RegionValue, string | null> = {
  hcm: "TP. Hồ Chí Minh",
  hn: "Hà Nội",
  dn: "Đà Nẵng",
  all: null,
};

export const PLACE_TYPES = [
  { value: "restaurant", label: "Quán ăn" },
  { value: "buffet", label: "Buffet" },
  { value: "cafe", label: "Cà phê" },
  { value: "spa", label: "Spa" },
  { value: "massage", label: "Massage" },
  { value: "salon", label: "Salon" },
  { value: "other", label: "Khác" },
] as const;

export function activeVoucherWhere(): Prisma.VoucherWhereInput {
  return { status: "published", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };
}

const placeListSelect = {
  id: true,
  name: true,
  slug: true,
  type: true,
  district: true,
  districtSlug: true,
  ward: true,
  lat: true,
  lng: true,
  images: true,
  vouchers: { where: activeVoucherWhere(), orderBy: { price: "asc" as const }, take: 1, select: { title: true, price: true, oldPrice: true } },
} satisfies Prisma.PlaceSelect;

/** Khoảng cách km giữa 2 tọa độ (Haversine) */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export async function listPlaces(opts: { region: RegionValue; type?: string; districtSlug?: string; near?: { lat: number; lng: number } }) {
  const city = REGION_CITY[opts.region];
  const places = await db.place.findMany({
    where: {
      status: "published",
      ...(city ? { city } : {}),
      ...(opts.type && PLACE_TYPES.some((t) => t.value === opts.type) ? { type: opts.type as Prisma.EnumPlaceTypeFilter["equals"] } : {}),
      ...(opts.districtSlug ? { districtSlug: opts.districtSlug } : {}),
    },
    select: placeListSelect,
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  const withDistance = places.map((p) => ({
    ...p,
    distance: opts.near && p.lat !== null && p.lng !== null ? distanceKm(opts.near, { lat: p.lat, lng: p.lng }) : null,
  }));
  if (opts.near) withDistance.sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9));
  return withDistance;
}

/** Quận có quán đang hiện (theo khu vực) */
export async function placeDistricts(region: RegionValue) {
  const city = REGION_CITY[region];
  const rows = await db.place.groupBy({
    by: ["district", "districtSlug"],
    where: { status: "published", ...(city ? { city } : {}) },
    _count: { _all: true },
    orderBy: { district: "asc" },
  });
  return rows.map((r) => ({ name: r.district, slug: r.districtSlug, count: r._count._all }));
}

export const findDistrict = cache(async (slug: string) => {
  const p = await db.place.findFirst({ where: { districtSlug: slug, status: "published" }, select: { district: true, districtSlug: true, city: true } });
  return p;
});

export const getPlaceBySlug = cache(async (slug: string) => {
  const place = await db.place.findUnique({
    where: { slug },
    include: { vouchers: { where: { status: { in: ["published", "expired"] } }, orderBy: [{ status: "desc" }, { price: "asc" }] } },
  });
  if (!place || place.status !== "published") return null;
  return place;
});
