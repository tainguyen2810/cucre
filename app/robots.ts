import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/go/", "/admin", "/api/", "/tim-kiem", "/giao-dien"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
