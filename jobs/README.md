# jobs/

Các script chạy nền, gọi bằng cron của aaPanel (không chạy node-cron bên trong app,
vì PM2 chạy nhiều tiến trình sẽ khiến job chạy lặp).

Ví dụ (thêm ở các giai đoạn sau):

- `npx tsx jobs/expire-deals.ts` – mỗi giờ: chuyển deal/coupon quá hạn sang `expired`
- `npx tsx jobs/record-prices.ts` – mỗi ngày: ghi PriceHistory
- `npx tsx jobs/import-coupons.ts` – nhập coupon từ API affiliate vào trạng thái `pending`
