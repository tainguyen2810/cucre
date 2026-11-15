import type { Metadata } from "next";
import { DealForm } from "@/components/admin/DealForm";
import { requireAdmin } from "@/lib/admin/auth";
import { formOptions } from "@/lib/admin/options";

export const metadata: Metadata = { title: "Thêm deal" };

export default async function NewDealPage() {
  await requireAdmin();
  const options = await formOptions();
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Thêm deal</h1>
      <DealForm
        options={options}
        values={{ type: "product", title: "", slug: "", affiliateUrl: "", images: [], summary: "", description: "", destination: "", techPros: "", techCons: "", techVerdict: "", status: "published", featured: false, expiresAt: "", couponIds: [] }}
      />
    </div>
  );
}
