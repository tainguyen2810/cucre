export const SITE = {
  name: "cucre.vn",
  tagline: "Săn deal cực rẻ – kỹ thuật viên soi trước",
  disclosure: "cucre.vn có thể nhận hoa hồng khi bạn mua qua liên kết. Giá bạn trả không đổi.",
  company: {
    name: "Công ty TNHH TM & DV Tin học ITSO",
    city: "TP. Hồ Chí Minh",
  },
  /** Link Zalo OA hoặc nhóm Zalo (ZALO_URL trong .env, đọc lúc chạy) */
  zaloUrl: process.env.ZALO_URL || process.env.NEXT_PUBLIC_ZALO_URL || "",
};

export const MAIN_NAV = [
  { href: "/", label: "Hot deal" },
  { href: "/ma-giam-gia", label: "Mã giảm giá" },
  { href: "/gia-re", label: "Giá rẻ" },
  { href: "/ky-thuat-so", label: "Kỹ thuật số" },
  { href: "/du-lich", label: "Du lịch" },
  { href: "/an-uong", label: "Ăn uống & Spa" },
  { href: "/blog", label: "Blog" },
] as const;

export const REGIONS = [
  { value: "hcm", label: "TP.HCM", short: "HCM" },
  { value: "hn", label: "Hà Nội", short: "HN" },
  { value: "dn", label: "Đà Nẵng", short: "ĐN" },
  { value: "all", label: "Toàn quốc", short: "Toàn quốc" },
] as const;

export type RegionValue = (typeof REGIONS)[number]["value"];
export const DEFAULT_REGION: RegionValue = "hcm";
export const REGION_COOKIE = "region";

export function parseRegion(value: string | undefined): RegionValue {
  return REGIONS.some((r) => r.value === value) ? (value as RegionValue) : DEFAULT_REGION;
}

/** URL gốc của site, dùng cho canonical, sitemap, JSON-LD */
export const SITE_URL = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/** Site key Cloudflare Turnstile (đọc lúc chạy, truyền xuống form) */
export const TURNSTILE_SITE_KEY = process.env.TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
