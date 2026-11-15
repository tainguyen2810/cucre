# Tự động hóa: nhập mã affiliate và kênh Telegram

Nguyên tắc: **không có gì tự lên web nếu bạn chưa duyệt.**
- Mã/deal nhập tự động luôn ở trạng thái **Chờ duyệt**. Duyệt ở trang quản trị **Tự động** (`/admin/tu-dong`).
- Bot Telegram chỉ gửi deal **đã duyệt** (đang hiện trên web).
- Mỗi lần chạy đều ghi nhật ký, xem ở cuối trang `/admin/tu-dong`.

## 1. Nhập mã từ Accesstrade

1. Đăng ký publisher tại Accesstrade, đăng ký các chiến dịch (Shopee, Lazada, Tiki, Klook, Agoda…).
2. Lấy **API key** trong tài khoản (mục API/Tài khoản), thêm vào `.env` trên server:

   ```ini
   ACCESSTRADE_API_KEY="khoa-cua-ban"
   ```

3. Khởi động lại app để trang quản trị nhận key: `pm2 reload cucre --update-env`.
4. Bấm **Nhập mã ngay** ở `/admin/tu-dong`, hoặc chạy:

   ```bash
   cd /www/wwwroot/cucre && npm run job:import
   ```

5. Duyệt từng mã (**Duyệt** / **Bỏ**) hoặc **Duyệt tất cả**. Có thể bấm vào mã để sửa tiêu đề, ngành, điều kiện trước khi duyệt.

Cách hoạt động (`lib/automation/`):
- `accesstrade.ts` gọi API `offers_informations`, mỗi mã trong một khuyến mãi thành một Coupon; khuyến mãi không có mã thành ưu đãi "Lấy ưu đãi".
- Sàn được nhận theo tên miền (shopee.vn → Shopee…); sàn chưa có sẽ được tạo mới.
- Không nhập trùng (khóa: sàn + mã nguồn). Mã đã duyệt sẽ không bị ghi đè; mã hết hạn bị bỏ qua.

> **Cần kiểm tra khi có tài khoản thật:** adapter viết theo cấu trúc phản hồi phổ biến của API Accesstrade. Nếu tên trường khác, sửa hàm `normalizeAccesstrade` trong `lib/automation/accesstrade.ts` (hoặc gửi tài liệu API cho Claude Code để chỉnh).

### Thêm nguồn khác (Shopee Affiliate, Lazada, Klook…)
Viết một hàm trả về danh sách `ImportedCoupon` (xem `lib/automation/types.ts`), rồi gọi `importCoupons(db, items)` trong `runCouponImport` (`lib/automation/import.ts`) khi có key tương ứng trong `.env`.

## 2. Kênh Telegram

1. Mở Telegram, chat với **@BotFather** → `/newbot` → đặt tên → nhận **token**.
2. Tạo kênh (ví dụ `@cucre_deal`), thêm bot vào kênh với quyền **Admin** (được đăng tin).
3. Thêm vào `.env`:

   ```ini
   TELEGRAM_BOT_TOKEN="123456:ABC..."
   TELEGRAM_CHAT_ID="@cucre_deal"      # kênh riêng tư: dùng ID dạng -100xxxxxxxxxx
   ```

4. `pm2 reload cucre --update-env`, vào `/admin/tu-dong` → **Xem trước tin hôm nay** → **Gửi lên kênh** để thử.

Mỗi ngày bot gửi 5 deal: ưu tiên deal **Nổi bật** (bấm ngôi sao ở danh sách deal), thiếu thì lấy deal giảm nhiều nhất. Link trong tin trỏ về trang deal trên cucre.vn (giữ SEO và đo click qua nút "Lấy deal").

Xem trước trên server mà không gửi:

```bash
npm run job:telegram -- --dry-run
```

## 3. Lịch chạy (cron aaPanel)

| Việc | Lịch | Lệnh |
| --- | --- | --- |
| Nhập mã | Mỗi 6 giờ | `cd /www/wwwroot/cucre && npm run job:import >> logs/cron.log 2>&1` |
| Ẩn mã/deal hết hạn | Mỗi giờ | `cd /www/wwwroot/cucre && npm run job:expire >> logs/cron.log 2>&1` |
| Gửi Telegram | 11:30 hằng ngày | `cd /www/wwwroot/cucre && npm run job:telegram >> logs/cron.log 2>&1` |
| Ghi lịch sử giá | 00:20 hằng ngày | `cd /www/wwwroot/cucre && npm run job:prices >> logs/cron.log 2>&1` |

## 4. Chưa làm (chờ thông tin từ bạn)
- Đăng deal lên **nhóm Zalo**: Zalo không có API đăng vào nhóm cá nhân; cần Zalo OA (Official Account) và gói tin nhắn của Zalo – cần tài khoản OA để làm tiếp.
- Cập nhật giá deal tự động từ datafeed: cần mạng affiliate có datafeed sản phẩm (Accesstrade có cho một số chiến dịch).
- Báo cáo doanh thu affiliate: cần API báo cáo của từng mạng.
