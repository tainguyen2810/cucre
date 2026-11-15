# Cơ sở dữ liệu cucre.vn

Schema: `prisma/schema.prisma`. Quy ước chung:

- Tiền lưu **số nguyên, đơn vị đồng** (899000 = 899.000đ).
- Cột `titleSearch` / `nameSearch`: chữ thường, không dấu (`lib/slug.ts` → `toSearchText`), để khách gõ "tai nghe chong on" vẫn tìm ra. Phải cập nhật mỗi khi sửa tiêu đề.
- Danh sách (ảnh, điểm cộng, lưu ý) lưu dạng JSON vì MySQL không có kiểu mảng.
- Trạng thái dùng enum; dữ liệu nhập tự động luôn vào `pending`.

## Các bảng

| Bảng | Dùng để | Ghi chú |
| --- | --- | --- |
| **Platform** | Sàn/nền tảng: Shopee, Lazada, TikTok Shop, Tiki, Klook, Agoda, ITSO | `network` = mạng affiliate (`accesstrade`, `shopee`, `direct`…) |
| **Category** | Danh mục dạng cây, chia theo mảng (`product`, `digital`, `travel`, `local`) | `parentId` trỏ về danh mục cha |
| **Deal** | Một sản phẩm/ưu đãi ở các mảng Giá rẻ, Kỹ thuật số, Du lịch | `discountPercent` tính khi lưu; `techPros`/`techCons`/`techVerdict` là khối "Đánh giá KTV"; `destination` cho du lịch; `externalId` chống nhập trùng khi lấy từ API |
| **PriceHistory** | Giá của deal theo ngày, để vẽ biểu đồ | Chỉ có ý nghĩa khi giá được cập nhật thật |
| **Coupon** | Mã giảm giá của sàn | `code` để trống nếu là ưu đãi không cần mã; `categoryId` để lọc theo ngành; `usedPercent` cho thanh "đã dùng" |
| **Place** | Quán/spa đối tác | `district` có dấu để hiển thị, `districtSlug` cho URL `/an-uong/binh-tan`; `contact`, `commissionPercent` chỉ admin xem |
| **Voucher** | Ưu đãi của một quán | `quantity` để trống = không giới hạn |
| **VoucherClaim** | Khách nhận mã voucher | **Dữ liệu cá nhân** (họ tên, SĐT): chỉ admin xem. Mỗi SĐT nhận 1 mã/voucher (ràng buộc trong DB). `consentAt` = lúc khách đồng ý xử lý dữ liệu |
| **PartnerLead** | Đơn đăng ký hợp tác từ trang /hop-tac | Trạng thái: mới → đã liên hệ → đã ký / từ chối |
| **Post** | Bài blog (Markdown) | Liên kết nhiều-nhiều với Deal để chèn "deal liên quan" |
| **SaleEvent** | Lịch sale: 11.11, 12.12, sale lương | Hiện trên trang mã giảm giá |
| **Click** | Mỗi lần khách bấm ra sàn qua `/go/[id]` | Không lưu IP; `ipHash` = mã băm IP + ngày để lọc click trùng |
| **AdminUser** | Tài khoản quản trị | Mật khẩu băm bcrypt; vai trò `admin` / `editor` |

## Bảng nối (Prisma tự tạo)

- `_DealCoupons`: deal ↔ mã giảm giá dùng kèm.
- `_PostDeals`: bài viết ↔ deal liên quan.

## Dữ liệu mẫu

`npm run db:seed` **xóa toàn bộ dữ liệu nội dung** (giữ AdminUser) rồi nạp: 7 sàn, 22 danh mục, 12 deal (kèm 30 ngày lịch sử giá), 8 coupon, 4 quán + voucher, 1 bài blog, 2 lịch sale. Lệnh tự từ chối chạy khi `NODE_ENV=production` (trừ khi đặt `SEED_FORCE=1`).

Tên quán, địa chỉ là bịa; link affiliate trỏ về trang chủ sàn; chưa có ảnh.
