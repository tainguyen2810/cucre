import type { Metadata } from "next";
import { PlaceForm } from "@/components/admin/PlaceForm";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Thêm quán" };

export default async function NewPlacePage() {
  await requireAdmin();
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Thêm quán</h1>
      <p className="text-sm text-muted">Tạo quán trước, sau đó thêm ưu đãi (voucher) ở trang sửa quán.</p>
      <PlaceForm values={{ name: "", slug: "", type: "restaurant", address: "", district: "", ward: "", city: "TP. Hồ Chí Minh", lat: "", lng: "", openingHours: "", description: "", commissionPercent: "", contact: "", status: "published", images: [] }} />
    </div>
  );
}
