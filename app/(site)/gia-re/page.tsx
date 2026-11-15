import type { Metadata } from "next";
import { DealListing, listingMetadata } from "@/components/DealListing";

export async function generateMetadata({ searchParams }: PageProps<"/gia-re">): Promise<Metadata> {
  return listingMetadata(
    "/gia-re",
    await searchParams,
    "Deal đồ công nghệ giá rẻ hôm nay",
    "Deal SSD, chuột, bàn phím, tai nghe, phụ kiện giá rẻ trên Shopee, Lazada, TikTok Shop – có nhận xét của kỹ thuật viên.",
  );
}

export default async function CheapDealsPage({ searchParams }: PageProps<"/gia-re">) {
  return (
    <DealListing
      segment="product"
      basePath="/gia-re"
      tabs="price"
      title="Deal công nghệ giá rẻ"
      intro="Đồ công nghệ và phụ kiện đang giảm giá, mỗi deal đều có nhận xét của kỹ thuật viên."
      searchParams={await searchParams}
    />
  );
}
