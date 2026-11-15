// Nhập mã giảm giá từ các mạng affiliate đã cấu hình (ACCESSTRADE_API_KEY...) vào trạng thái CHỜ DUYỆT.
// Cron aaPanel mỗi 6 giờ:  cd /www/wwwroot/cucre && npm run job:import
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../lib/generated/prisma/client";
import { runCouponImport } from "../lib/automation/import";

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });

runCouponImport(db)
  .then((r) => {
    console.log(`[${new Date().toISOString()}] ${r.summary}`);
    if (!r.ok) process.exitCode = 1;
  })
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
