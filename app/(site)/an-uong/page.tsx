import type { Metadata } from "next";
import { PlaceListing } from "@/components/places/PlaceListing";
import { param } from "@/lib/url";

export async function generateMetadata({ searchParams }: PageProps<"/an-uong">): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: "Voucher ăn uống, spa giảm giá – nhận mã miễn phí",
    description: "Voucher buffet, quán ăn, cà phê, spa, massage giảm giá ở TP.HCM. Nhận mã miễn phí bằng số điện thoại, xem bản đồ quán gần bạn.",
    alternates: { canonical: "/an-uong" },
    robots: param(sp, "loai") || param(sp, "gan") ? { index: false, follow: true } : undefined,
  };
}

export default async function FoodPage({ searchParams }: PageProps<"/an-uong">) {
  return (
    <PlaceListing
      searchParams={await searchParams}
      title="Ăn uống & Spa"
      intro="Ưu đãi riêng từ quán và spa đối tác. Nhận mã miễn phí bằng số điện thoại, đưa mã cho quán khi thanh toán."
    />
  );
}
