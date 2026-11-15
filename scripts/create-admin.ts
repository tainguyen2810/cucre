// Tạo hoặc đặt lại mật khẩu tài khoản quản trị – dùng được trên production (không xóa dữ liệu).
//   ADMIN_PASSWORD='mat-khau-manh' npm run admin:create -- ten@cucre.vn
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../lib/generated/prisma/client";

const email = process.argv[2]?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error("Cách dùng: ADMIN_PASSWORD='...' npm run admin:create -- email@cucre.vn");
  process.exit(1);
}
if (!password || password.length < 10) {
  console.error("Cần biến ADMIN_PASSWORD dài tối thiểu 10 ký tự.");
  process.exit(1);
}

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });

async function main() {
  const passwordHash = await bcrypt.hash(password!, 12);
  const user = await db.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, role: "admin", name: "Quản trị" },
  });
  console.log(`Đã lưu tài khoản admin: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
