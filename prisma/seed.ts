// Seed tối thiểu: tạo tài khoản admin đầu tiên. Dữ liệu mẫu đầy đủ thêm ở Prompt 2.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../lib/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) {
    console.log("Bỏ qua tạo admin: cần SEED_ADMIN_EMAIL và SEED_ADMIN_PASSWORD (>= 8 ký tự) trong .env");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await db.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, role: "admin", name: "Quản trị" },
  });
  console.log(`Đã có tài khoản admin: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
