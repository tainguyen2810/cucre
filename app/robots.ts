import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Đọc SITE_URL lúc chạy (không đóng cứng lúc build)
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/go/", "/admin", "/api/", "/tim-kiem", "/giao-dien"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
