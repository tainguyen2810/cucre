// Ghi giá hiện tại của mọi deal đang hiện vào PriceHistory (mỗi deal tối đa 1 bản ghi/ngày theo giờ VN).
// Chạy hằng ngày bằng cron aaPanel:  cd /www/wwwroot/cucre && npm run job:prices
// Giá chỉ chính xác khi admin (hoặc job nhập tự động) cập nhật giá thật của deal.
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../lib/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });

async function main() {
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
  const startOfDay = new Date(`${today}T00:00:00+07:00`);
  const deals = await db.deal.findMany({
    where: { status: "published", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    select: { id: true, price: true, priceHistory: { where: { recordedAt: { gte: startOfDay } }, select: { id: true }, take: 1 } },
  });
  const toInsert = deals.filter((d) => d.priceHistory.length === 0).map((d) => ({ dealId: d.id, price: d.price }));
  if (toInsert.length) await db.priceHistory.createMany({ data: toInsert });
  console.log(`[${new Date().toISOString()}] Ghi giá ${toInsert.length}/${deals.length} deal`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
