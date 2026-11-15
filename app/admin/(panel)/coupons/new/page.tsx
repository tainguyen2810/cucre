import type { Metadata } from "next";
import { CouponForm } from "@/components/admin/CouponForm";
import { requireAdmin } from "@/lib/admin/auth";
import { formOptions } from "@/lib/admin/options";

export const metadata: Metadata = { title: "Thêm mã giảm giá" };

export default async function NewCouponPage() {
  await requireAdmin();
  const options = await formOptions();
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Thêm mã giảm giá</h1>
      <CouponForm options={options} values={{ code: "", title: "", conditions: "", usedPercent: 0, url: "", status: "published", featured: false, startsAt: "", expiresAt: "" }} />
    </div>
  );
}
