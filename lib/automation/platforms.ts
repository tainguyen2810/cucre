import { slugify } from "../slug";
import type { Db } from "./types";

/** Tên miền / mã merchant → sàn */
const KNOWN: { match: RegExp; slug: string; name: string }[] = [
  { match: /shopee/i, slug: "shopee", name: "Shopee" },
  { match: /lazada/i, slug: "lazada", name: "Lazada" },
  { match: /tiktok/i, slug: "tiktok-shop", name: "TikTok Shop" },
  { match: /tiki/i, slug: "tiki", name: "Tiki" },
  { match: /klook/i, slug: "klook", name: "Klook" },
  { match: /agoda/i, slug: "agoda", name: "Agoda" },
  { match: /traveloka/i, slug: "traveloka", name: "Traveloka" },
];

export function detectPlatform(merchant: string, domain?: string | null): { slug: string; name: string } {
  const hay = `${merchant} ${domain ?? ""}`;
  const known = KNOWN.find((k) => k.match.test(hay));
  if (known) return { slug: known.slug, name: known.name };
  const base = (domain || merchant).replace(/^www\./, "").split(".")[0] || merchant;
  return { slug: slugify(base) || "khac", name: base.charAt(0).toUpperCase() + base.slice(1) };
}

/** Lấy id sàn, tự tạo nếu chưa có (mạng affiliate = nguồn nhập) */
export async function ensurePlatform(db: Db, slug: string, name: string, network: string): Promise<number> {
  const found = await db.platform.findUnique({ where: { slug }, select: { id: true } });
  if (found) return found.id;
  const created = await db.platform.create({ data: { slug, name, network, sortOrder: 100 } });
  return created.id;
}
