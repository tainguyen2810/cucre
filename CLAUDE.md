# CLAUDE.md – Dự án cucre.vn

@AGENTS.md

## Dự án là gì
cucre.vn ("cực rẻ") là web săn hot deal tiếng Việt, vận hành bởi Công ty TNHH TM & DV Tin học ITSO (TP.HCM).
5 mảng: Mã giảm giá · Giá rẻ (đồ công nghệ) · Kỹ thuật số · Du lịch · Ăn uống & Spa, cộng Blog "Nên mua gì" và trang Hợp tác cho quán/spa.
Kiếm tiền: hoa hồng affiliate (Shopee, Lazada, TikTok Shop, Accesstrade, Klook, Agoda…), bán trực tiếp hàng kỹ thuật số của ITSO (Office 365, Windows bản quyền có hóa đơn), chiết khấu từ quán/spa đối tác.
Điểm khác biệt: mỗi deal có "Đánh giá của kỹ thuật viên" (điểm cộng, lưu ý, kết luận).

## Công nghệ
- Next.js 16 (App Router) + TypeScript (strict), Server Components mặc định. Đây là bản mới: đọc tài liệu trong `node_modules/next/dist/docs/` trước khi dùng API lạ. `middleware.ts` đã đổi thành `proxy.ts`. `cacheComponents` đang tắt (next.config.ts) để trang đọc DB render động cho đơn giản.
- Tailwind CSS. Font: Be Vietnam Pro (next/font/google, subset vietnamese).
- Prisma 7 + MySQL 8: cấu hình ở `prisma.config.ts`, client sinh vào `lib/generated/prisma` (không commit), kết nối qua driver adapter `@prisma/adapter-mariadb`. Luôn import `db` từ `lib/db.ts`.
- Auth.js v5 (credentials) chỉ cho /admin, cấu hình ở `lib/auth.ts`; `proxy.ts` chặn /admin/*, nhưng mỗi trang và Server Action admin vẫn phải tự gọi `auth()`. Mật khẩu băm bcrypt.
- Ảnh: lưu trong thư mục `UPLOAD_DIR` NGOÀI thư mục code (file thêm vào `public/` lúc đang chạy sẽ không được phục vụ); production để Nginx phục vụ `/uploads/`.
- Bản đồ: Leaflet + OpenStreetMap.
- Triển khai: server Linux dùng aaPanel, chạy bằng PM2 sau Nginx reverse proxy, SSL Let's Encrypt.

## Cấu trúc thư mục (mục tiêu)
```
app/
  (site)/            # trang công khai: page.tsx (trang chủ), ma-giam-gia, gia-re, deal/[slug],
                     # ky-thuat-so, du-lich, an-uong, an-uong/[slug], blog, blog/[slug], hop-tac
  admin/             # trang quản trị (yêu cầu đăng nhập)
  go/[id]/route.ts   # ghi Click rồi redirect 302 tới link affiliate
  api/               # route handlers (form voucher, form hợp tác, upload)
  sitemap.ts, robots.ts
components/          # DealCard, CouponTicket, PlaceCard, Badge, Chip, Pagination, Header, Footer...
lib/                 # db.ts (Prisma client), auth.ts, slug.ts (bỏ dấu tiếng Việt), format.ts (tiền VND)
prisma/              # schema.prisma, migrations, seed.ts
jobs/                # script chạy bằng cron của aaPanel (`npx tsx jobs/xxx.ts`), KHÔNG dùng node-cron trong app
design/              # file thiết kế tham khảo xuất từ canvas (chỉ đọc)
```

## Dữ liệu (Prisma models)
- Platform: tên, slug, logo, mạng affiliate.
- Category: tên, slug, mảng (`product` | `digital` | `travel` | `local`), parentId.
- Deal: type, title, slug, images, price, oldPrice, discountPercent (tự tính), affiliateUrl, platformId, categoryId, techPros[], techCons[], techVerdict, status (`draft` | `pending` | `published` | `expired`), featured, expiresAt.
- PriceHistory: dealId, price, recordedAt.
- Coupon: platformId, code, title, conditions, minOrder, expiresAt, usedPercent, url, status.
- Place: name, slug, type, address, district, ward, lat, lng, openingHours, images, commissionPercent, contact.
- Voucher: placeId, title, price, oldPrice, conditions, quantity, expiresAt.
- VoucherClaim: voucherId, fullName, phone, code (duy nhất), status (`issued` | `used` | `cancelled`), createdAt.
- PartnerLead: tên quán, loại hình, địa chỉ, người liên hệ, phone, chiết khấu đề xuất, ưu đãi muốn chạy, status.
- Post: title, slug, category, coverImage, content (Markdown), relatedDealIds, publishedAt.
- Click: dealId hoặc couponId, platformId, referrer, userAgent (rút gọn), createdAt. Không lưu IP đầy đủ.
- SaleEvent: name, startsAt, endsAt.
- AdminUser: email, passwordHash, role.

## Giao diện (theo thiết kế trong design/)
- Nền #FFFFFF và #F6F5F2; màu chính đỏ #D92D20 (hover #B42318); nhãn vàng #FEC84B (chữ đen); chữ #1D1D1B; chữ phụ #5F5E59; viền #E7E5E0.
- Xanh lá cho "KTV nhận xét": nền #ECFDF3, chữ #05603A. Cam cho "Lưu ý": nền #FFFAEB, chữ #93370D.
- Thẻ bo 14px, viền mảnh, không gradient, không emoji; icon dạng nét (lucide-react).
- Header mọi trang: logo chữ "cucre.vn" ("cucre" màu đỏ), ô tìm kiếm viền đỏ, chọn khu vực, nút đen "Nhận deal qua Zalo"; menu: Hot deal · Mã giảm giá · Giá rẻ · Kỹ thuật số · Du lịch · Ăn uống & Spa · Blog.
- Footer luôn có câu: "cucre.vn có thể nhận hoa hồng khi bạn mua qua liên kết. Giá bạn trả không đổi."
- Responsive tới 390px; vùng bấm tối thiểu 44px; tương phản chữ đạt WCAG AA.

## Quy tắc
- Toàn bộ chữ hiển thị bằng tiếng Việt có dấu; URL dùng slug không dấu (vd. /deal/ssd-nvme-512gb).
- Mọi link ra sàn đi qua /go/[id], thẻ <a> có rel="sponsored nofollow noopener" và target="_blank".
- Tiền hiển thị dạng 1.290.000đ (Intl.NumberFormat vi-VN).
- Deal/coupon hết hạn: tự chuyển `expired`, trang vẫn tồn tại, hiện nhãn "Đã hết hạn" kèm deal tương tự.
- SEO: generateMetadata cho từng trang, sitemap.ts, robots.ts, JSON-LD (Product/Offer, LocalBusiness, Article).
- Số điện thoại khách nhận voucher là dữ liệu cá nhân: chỉ admin xem; có trang Chính sách bảo mật.
- Dữ liệu nhập tự động từ API affiliate luôn vào trạng thái `pending`, chỉ hiện sau khi admin duyệt.
- Không commit file .env, API key, mật khẩu. Có .env.example.
- Validate mọi input form bằng zod; chống gửi trùng form voucher (giới hạn theo số điện thoại + voucher), giới hạn tần suất theo IP, có ô tích đồng ý xử lý dữ liệu cá nhân.
- Tìm kiếm: lưu thêm cột tiêu đề không dấu (`lib/slug.ts` → `removeVietnameseTones`) để tìm được cả khi gõ không dấu.
- `/go/[id]`: không index (robots + header `X-Robots-Tag`), bỏ qua bot khi ghi Click.
- Lịch sử giá chỉ chính xác khi giá được cập nhật thật (sửa tay hoặc datafeed); đừng hiển thị biểu đồ khi chưa đủ dữ liệu.

## Lệnh thường dùng
- `npm run dev` – chạy local (http://localhost:3000)
- `npm run build` – build production; `npm run lint`; `npm run typecheck` (chạy sau build để có type route)
- `npm run db:migrate -- --name <ten>` – tạo migration khi đổi schema (user MySQL cần quyền tạo shadow database)
- `npm run db:deploy` – áp migration trên production
- `npm run db:seed` – nạp dữ liệu mẫu + tài khoản admin (SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD)
- `npm run db:studio` – xem dữ liệu

## Cách làm việc
- Trước mỗi prompt: rà soát yêu cầu và code hiện có, viết kế hoạch triển khai (việc sẽ làm, quyết định kỹ thuật, điểm cần chủ dự án chọn), cập nhật vào `docs/tien-do.html`, và CHỜ duyệt rồi mới code.
- Mỗi prompt làm trên một nhánh git riêng; xong thì chạy build/lint/typecheck, tóm tắt thay đổi, cập nhật trang tiến độ.
- Ưu tiên đơn giản, dễ bảo trì cho một người quản trị; hỏi lại trước khi thêm dịch vụ trả phí hoặc thư viện lớn.
