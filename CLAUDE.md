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
Chi tiết từng bảng: `docs/du-lieu.md`. Schema: `prisma/schema.prisma`.
- Bảng: Platform, Category (cây, theo mảng `product|digital|travel|local`), Deal, PriceHistory, Coupon, Place, Voucher, VoucherClaim, PartnerLead, Post, SaleEvent, Click, AdminUser.
- Tiền là số nguyên (đồng). Danh sách (images, techPros, techCons) lưu JSON.
- Cột `titleSearch`/`nameSearch` (không dấu, `toSearchText`) phải cập nhật mỗi khi sửa tiêu đề/tên.
- `discountPercent` tính bằng `discountPercent()` trong `lib/format.ts` khi lưu Deal.
- Deal ↔ Coupon (mã dùng kèm) và Post ↔ Deal (deal liên quan) là quan hệ nhiều-nhiều.
- VoucherClaim: duy nhất theo (voucherId, phone); lưu `consentAt`. Click và VoucherClaim chỉ lưu `ipHash`, không lưu IP.
- `npm run db:seed` XÓA dữ liệu nội dung rồi nạp mẫu; không chạy trên production.

## Giao diện (theo design/theme-preview.html)
- Mọi màu, bo góc, cỡ chữ là token trong `app/globals.css` (Tailwind 4 `@theme`). Dùng class token (`bg-brand`, `text-muted`, `rounded-xl`, `text-price`…), KHÔNG viết mã màu trực tiếp.
  - Thương hiệu: brand #D92D20 (hover #B42318), brand-soft #FEF3F2 (nền coupon), brand-line #F4C7C3, flash #FEC84B (nhãn sale, chữ đen), progress #F79009 (chỉ cho thanh, không cho chữ).
  - Trung tính: ink #1D1D1B, muted #5F5E59, subtle #6B6963 (giá cũ), line #E7E5E0, line-strong #D6D3CC, placeholder #EFEDE8, canvas #F6F5F2 (nền trang), surface #FFFFFF.
  - Trạng thái: ok #05603A/#ECFDF3 ("KTV nhận xét"), warn #93370D/#FFFAEB ("Lưu ý"), info #1849A9/#EFF4FF.
  - Bo góc: sm 6 · md 8 · lg 10 · xl 14 (thẻ) · 2xl 18 (banner) · full (chip). Khoảng cách bậc 4px. Khung tối đa `max-w-site` (1200px).
  - Cỡ chữ: `text-hero` 44, `text-page` 32, `text-section` 26 (đều 800), tên thẻ 16/600, `text-price` 22/800, nội dung 15, chữ phụ 13.
- Thẻ viền mảnh, không gradient, không emoji/ký tự ✓; icon dạng nét (lucide-react).
- Component dùng lại: `components/ui/` (Button/LinkButton/buttonClass, Badge, ChipLink, Price, Pagination, ImageBox) và `components/` (Header, Footer, MainNav, RegionSelect, SearchBox, DealCard, CouponTicket, CopyCodeButton, PlaceCard). Xem tất cả ở `/giao-dien` khi chạy `npm run dev` (trang tắt trên production).
- Header: logo, ô tìm kiếm viền đỏ (GET `/tim-kiem?q=`), chọn khu vực (cookie `region`: hcm|hn|dn|all, mặc định hcm), nút đen "Nhận deal qua Zalo" (`NEXT_PUBLIC_ZALO_URL`), menu 7 mục trong `lib/site.ts`. Điện thoại: menu là dải chip vuốt ngang.
- Footer luôn có câu công khai hoa hồng (`SITE.disclosure` trong `lib/site.ts`).
- Link: dùng helper trong `lib/links.ts` (`goDeal` → /go/123, `goCoupon` → /go/c45, `SPONSORED_LINK`).
- Responsive tới 390px không cuộn ngang; vùng bấm tối thiểu 44px; tương phản đạt WCAG AA.

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

## Trang & truy vấn đã có
- Trang: `/` (trang chủ), `/ma-giam-gia`, `/ma-giam-gia/[san]` (lọc ngành `?nganh=`, mã hết hạn `?het-han=1`), `/gia-re` (`?gia=`, `?danh-muc=`, `?san=`, `?sap-xep=`, `?page=`, 24 deal/trang), `/deal/[slug]`, `/tim-kiem?q=`, `/go/[id]` (`123` = deal, `c45` = coupon), `sitemap.xml`, `robots.txt`.
- Truy vấn dùng lại ở `lib/queries/` (`deals.ts`, `coupons.ts`, `listing.ts`): luôn dùng `activeDealWhere()` / `activeCouponWhere()` để chỉ lấy mục đã đăng và còn hạn; `dealCardSelect` cho DealCard; `listDeals(segment, filters)` cho các trang danh sách theo mảng (dùng lại cho /ky-thuat-so, /du-lich).
- Trang có bộ lọc trên URL: canonical về trang gốc và `noindex, follow` khi có bộ lọc.
- Tham số URL: dùng `param()`, `pageParam()`, `hrefWith()` trong `lib/url.ts`.
- Job: `npm run job:expire` (jobs/expire-items.ts) – cron mỗi giờ.

## Trang quản trị (/admin)
- `/admin/login` (route group `(auth)`), các trang còn lại trong `(panel)` – layout gọi `requireAdmin()`. Mọi Server Action admin cũng phải gọi `requireAdmin()` (lib/admin/auth.ts). Đăng nhập sai 5 lần/15 phút/IP bị chặn tạm.
- Form admin dùng `useFormAction` (components/admin/useFormAction.ts) thay cho `<form action>` để React không xóa trắng form khi báo lỗi; nút gửi là `SubmitButton pending={pending}`.
- Lưu Deal: tự tính `discountPercent`, `titleSearch`, slug không trùng (`uniqueSlug`), `publishedAt` lần đầu đăng, và ghi `PriceHistory` khi tạo hoặc khi giá đổi.
- Ảnh: client gửi từng ảnh tới `POST /api/upload` (cần đăng nhập) → sharp thu nhỏ 1200px, WebP, lưu `UPLOAD_DIR/yyyy/mm/`; URL dạng `/uploads/...` lưu trong cột JSON `images`. Local: route `app/uploads/[...path]` phục vụ file; production: Nginx phục vụ `/uploads/`.
- Thống kê: `lib/admin/stats.ts` (click theo ngày giờ VN, theo sàn, top deal; "người" = COUNT DISTINCT ipHash).
- Ngày giờ trong form: `toLocalInput` / `fromLocalInput` (giờ VN) trong lib/admin/form.ts.

## Lệnh thường dùng
- `npm run dev` – chạy local (http://localhost:3000)
- `npm run build` – build production; `npm run lint`; `npm run typecheck` (chạy sau build để có type route)
- `npm run db:migrate` – tạo migration khi đổi schema rồi sinh lại Prisma client (Prisma 7 không tự sinh); user MySQL cần quyền tạo shadow database
- `npm run db:deploy` – áp migration trên production
- `npm run db:seed` – XÓA dữ liệu nội dung rồi nạp mẫu + tài khoản admin (SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD)
- `npm run db:studio` – xem dữ liệu

## Cách làm việc
- Trước mỗi prompt: rà soát yêu cầu và code hiện có, viết kế hoạch triển khai (việc sẽ làm, quyết định kỹ thuật, điểm cần chủ dự án chọn), cập nhật vào `docs/tien-do.html`. (Từ Prompt 5, chủ dự án cho phép tự làm hết không chờ duyệt và tự gộp PR vào `main` khi xong mỗi prompt; ghi rõ các giả định để chủ dự án sửa sau.)
- Mỗi prompt làm trên một nhánh git riêng; xong thì chạy build/lint/typecheck, tóm tắt thay đổi, cập nhật trang tiến độ.
- Ưu tiên đơn giản, dễ bảo trì cho một người quản trị; hỏi lại trước khi thêm dịch vụ trả phí hoặc thư viện lớn.
