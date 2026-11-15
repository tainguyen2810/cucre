// Chuyển deal/coupon/voucher quá hạn sang trạng thái `expired`.
// Chạy mỗi giờ bằng cron aaPanel:  cd /www/wwwroot/cucre && npx tsx jobs/expire-items.ts
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../lib/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });

async function main() {
  const now = new Date();
  const [deals, coupons, vouchers] = await Promise.all([
    db.deal.updateMany({ where: { status: "published", expiresAt: { lt: now } }, data: { status: "expired" } }),
    db.coupon.updateMany({ where: { status: "published", expiresAt: { lt: now } }, data: { status: "expired" } }),
    db.voucher.updateMany({ where: { status: "published", expiresAt: { lt: now } }, data: { status: "expired" } }),
  ]);
  console.log(`[${now.toISOString()}] Hết hạn: ${deals.count} deal, ${coupons.count} coupon, ${vouchers.count} voucher`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
