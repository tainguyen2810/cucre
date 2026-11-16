import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "cucre.vn – Săn deal cực rẻ, mã giảm giá mỗi ngày",
    template: "%s | cucre.vn",
  },
  description:
    "Mã giảm giá Shopee, Lazada, TikTok Shop, deal đồ công nghệ, phần mềm bản quyền, du lịch và ăn uống giá tốt – có nhận xét của kỹ thuật viên.",
  openGraph: { siteName: "cucre.vn", locale: "vi_VN", type: "website" },
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
