# jobs/

Các script chạy nền, gọi bằng cron của aaPanel (không chạy node-cron bên trong app,
vì PM2 chạy nhiều tiến trình sẽ khiến job chạy lặp).

Ví dụ (thêm ở các giai đoạn sau):

- `npx tsx jobs/expire-items.ts` – mỗi giờ: chuyển deal/coupon/voucher quá hạn sang `expired` (đã có)
- `npx tsx jobs/record-prices.ts` (`npm run job:prices`) – mỗi ngày: ghi PriceHistory (đã có)
- `npx tsx jobs/import-coupons.ts` – nhập coupon từ API affiliate vào trạng thái `pending`
