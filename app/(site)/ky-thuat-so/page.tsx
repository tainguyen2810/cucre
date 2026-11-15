import type { Metadata } from "next";
import { BadgeCheck, FileText, Headset } from "lucide-react";
import { DealListing, listingMetadata } from "@/components/DealListing";

export async function generateMetadata({ searchParams }: PageProps<"/ky-thuat-so">): Promise<Metadata> {
  return listingMetadata(
    "/ky-thuat-so",
    await searchParams,
    "Phần mềm bản quyền giá rẻ – Office 365, Windows, diệt virus",
    "Microsoft 365, Windows bản quyền có hóa đơn VAT, phần mềm diệt virus, VPN giá tốt. Hỗ trợ cài đặt bởi kỹ thuật viên ITSO.",
  );
}

const PROMISES = [
  { icon: BadgeCheck, text: "Bản quyền chính hãng" },
  { icon: FileText, text: "Xuất hóa đơn VAT cho doanh nghiệp" },
  { icon: Headset, text: "Kỹ thuật viên hỗ trợ cài đặt" },
];

export default async function DigitalPage({ searchParams }: PageProps<"/ky-thuat-so">) {
  return (
    <DealListing
      segment="digital"
      basePath="/ky-thuat-so"
      tabs="price"
      title="Kỹ thuật số & phần mềm bản quyền"
      intro="Office, Windows, diệt virus, VPN… giá tốt. Hàng của ITSO được bán trực tiếp, có hóa đơn."
      searchParams={await searchParams}
    >
      <ul className="grid gap-2 sm:grid-cols-3">
        {PROMISES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-3 text-sm font-semibold">
            <Icon className="size-5 shrink-0 text-ok" aria-hidden />
            {text}
          </li>
        ))}
      </ul>
    </DealListing>
  );
}
