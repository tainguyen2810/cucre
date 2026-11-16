# cucre.vn

Web săn hot deal tiếng Việt: mã giảm giá, đồ công nghệ giá rẻ, kỹ thuật số, du lịch, ăn uống & spa.
Xem `CLAUDE.md` để biết quy ước dự án.

## Công nghệ

Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · Prisma 7 + MySQL 8 · Auth.js v5

## Chạy local

Yêu cầu: Node.js ≥ 20.19, MySQL 8 (hoặc MariaDB ≥ 10.6).

1. Cài thư viện (tự chạy `prisma generate`):

   ```bash
   npm install
   ```

2. Tạo database và user MySQL (user cần quyền tạo database tạm để Prisma tạo "shadow database" khi chạy migrate dev):

   ```sql
   CREATE DATABASE cucre CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'cucre'@'localhost' IDENTIFIED BY 'matkhau';
   GRANT ALL ON *.* TO 'cucre'@'localhost';
   ```

3. Tạo file `.env` từ mẫu rồi điền `DATABASE_URL`, `AUTH_SECRET` (`npx auth secret`), `SEED_ADMIN_PASSWORD` (hoặc bỏ qua bước này, chạy `npm run dev` rồi mở `/cai-dat`):

   ```bash
   cp .env.example .env
   ```

4. Tạo bảng và tài khoản admin:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Chạy:

   ```bash
   npm run dev
   ```

   Mở http://localhost:3000. Trang quản trị ở `/admin` (yêu cầu đăng nhập).

## Lệnh

| Lệnh | Việc |
| --- | --- |
| `npm run dev` | Chạy môi trường phát triển |
| `npm run build` / `npm start` | Build và chạy production |
| `npm run lint` / `npm run typecheck` | Kiểm tra mã |
| `npm run db:migrate` | Tạo migration mới khi đổi `prisma/schema.prisma` |
| `npm run db:deploy` | Áp migration trên server |
| `npm run db:seed` | Nạp dữ liệu mẫu |
| `npm run db:studio` | Giao diện xem dữ liệu |
| `npm run job:expire` | Chuyển deal/mã quá hạn sang hết hạn (cron mỗi giờ) |
| `npm run admin:create -- email` | Tạo/đặt lại admin (cần `ADMIN_PASSWORD`) |
| `npm run backup` | Sao lưu MySQL |

## Triển khai

Cách nhanh: clone code, chạy `bash scripts/bootstrap.sh`, rồi mở `/cai-dat` trên trình duyệt để cài bằng wizard. Chi tiết: [docs/trien-khai.md](docs/trien-khai.md): aaPanel, PM2, Nginx, SSL, cron, sao lưu, cập nhật phiên bản (`bash scripts/deploy.sh`).

## Cấu trúc

```
app/(site)/     trang công khai
app/admin/      trang quản trị
app/api/        route handlers (auth, form, upload)
app/go/[id]/    chuyển hướng affiliate có ghi click
components/     component giao diện dùng lại
lib/            db, auth, slug, định dạng tiền
prisma/         schema, migration, seed
jobs/           script chạy bằng cron
design/         thiết kế tham khảo (chỉ đọc)
```
