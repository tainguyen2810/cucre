// Gửi 5 deal nổi bật ĐÃ DUYỆT lên kênh Telegram. Xem trước không gửi:  npm run job:telegram -- --dry-run
// Cron aaPanel hằng ngày 11:30:  cd /www/wwwroot/cucre && npm run job:telegram
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../lib/generated/prisma/client";
import { runTelegramDaily } from "../lib/automation/telegram";

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });
const dryRun = process.argv.includes("--dry-run");

runTelegramDaily(db, process.env, dryRun)
  .then((r) => {
    if (dryRun) console.log(r.message || r.summary);
    console.log(`[${new Date().toISOString()}] ${r.summary}`);
    if (!r.ok) process.exitCode = 1;
  })
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
