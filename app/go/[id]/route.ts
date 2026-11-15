import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { couponListPath, dealPath } from "@/lib/links";
import { clientIp, dailyIpHash, isBot, safeExternalUrl } from "@/lib/request";

// /go/123 → deal 123, /go/c45 → coupon 45. Ghi Click rồi chuyển hướng 302 tới link affiliate.

const NO_INDEX = { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" };

function redirect(url: string | URL) {
  return NextResponse.redirect(url, { status: 302, headers: NO_INDEX });
}

function notFound() {
  return new NextResponse("Không tìm thấy liên kết", { status: 404, headers: NO_INDEX });
}

const isPast = (d: Date | null) => d !== null && d.getTime() < Date.now();

async function recordClick(req: NextRequest, data: { dealId?: number; couponId?: number; platformId: number }) {
  const userAgent = req.headers.get("user-agent");
  if (isBot(userAgent)) return;
  try {
    await db.click.create({
      data: {
        ...data,
        referrer: req.headers.get("referer")?.slice(0, 255) ?? null,
        userAgent: userAgent?.slice(0, 255) ?? null,
        ipHash: dailyIpHash(clientIp(req.headers)),
      },
    });
  } catch (error) {
    // Lỗi ghi log không được chặn khách ra sàn.
    console.error("Không ghi được click", error);
  }
}

export async function GET(req: NextRequest, ctx: RouteContext<"/go/[id]">) {
  const { id } = await ctx.params;

  const couponMatch = /^c(\d{1,9})$/.exec(id);
  if (couponMatch) {
    const coupon = await db.coupon.findUnique({
      where: { id: Number(couponMatch[1]) },
      select: { id: true, url: true, status: true, expiresAt: true, platformId: true, platform: { select: { slug: true } } },
    });
    if (!coupon || coupon.status === "pending") return notFound();
    if (coupon.status === "expired" || isPast(coupon.expiresAt)) {
      return redirect(new URL(couponListPath(coupon.platform.slug), req.url));
    }
    const target = safeExternalUrl(coupon.url);
    if (!target) return notFound();
    await recordClick(req, { couponId: coupon.id, platformId: coupon.platformId });
    return redirect(target);
  }

  if (!/^\d{1,9}$/.test(id)) return notFound();
  const deal = await db.deal.findUnique({
    where: { id: Number(id) },
    select: { id: true, slug: true, affiliateUrl: true, status: true, expiresAt: true, platformId: true },
  });
  if (!deal || deal.status === "draft" || deal.status === "pending") return notFound();
  if (deal.status === "expired" || isPast(deal.expiresAt)) {
    return redirect(new URL(dealPath(deal.slug), req.url));
  }
  const target = safeExternalUrl(deal.affiliateUrl);
  if (!target) return notFound();
  await recordClick(req, { dealId: deal.id, platformId: deal.platformId });
  return redirect(target);
}
