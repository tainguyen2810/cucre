import "server-only";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Một PrismaClient dùng chung, tạo KHI CẦN (lần đầu truy vấn) để app vẫn khởi động được
// khi chưa có .env – lúc đó mọi trang được chuyển sang wizard /cai-dat.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function client(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("Thiếu DATABASE_URL – chưa cài đặt (mở /cai-dat)");
    globalForPrisma.prisma = new PrismaClient({ adapter: new PrismaMariaDb(url) });
  }
  return globalForPrisma.prisma;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const c = client();
    const value = Reflect.get(c, prop);
    return typeof value === "function" ? value.bind(c) : value;
  },
});
