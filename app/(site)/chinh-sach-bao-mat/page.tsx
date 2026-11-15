import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description: "cucre.vn thu thập dữ liệu gì, dùng để làm gì, lưu bao lâu và quyền của bạn đối với dữ liệu cá nhân.",
  alternates: { canonical: "/chinh-sach-bao-mat" },
};

// Bản mẫu – cần bộ phận pháp lý/kế toán của ITSO rà soát trước khi chạy chính thức.
export default function PrivacyPage() {
  return (
    <article className="article mx-auto">
      <h1 className="text-[28px] leading-tight font-extrabold md:text-page">Chính sách bảo mật</h1>
      <p className="text-sm text-muted">Cập nhật ngày 15/11/2026</p>
      <p>
        cucre.vn do <b>{SITE.company.name}</b> ({SITE.company.city}) vận hành. Chúng tôi tôn trọng và bảo vệ dữ liệu cá nhân của bạn theo quy định pháp luật Việt Nam về bảo vệ dữ liệu cá nhân. Chính sách này giải thích chúng tôi thu thập gì, dùng làm gì và bạn có quyền gì.
      </p>
      <h2>1. Dữ liệu chúng tôi thu thập</h2>
      <ul>
        <li><b>Khi nhận voucher ăn uống, spa:</b> họ tên, số điện thoại.</li>
        <li><b>Khi đăng ký hợp tác:</b> tên quán, địa chỉ, tên người liên hệ, số điện thoại, email (nếu có).</li>
        <li><b>Khi bấm vào deal hoặc mã giảm giá:</b> trang bạn đến từ, loại trình duyệt, và một mã băm không thể đảo ngược tạo từ địa chỉ IP (đổi mỗi ngày). Chúng tôi <b>không lưu địa chỉ IP</b>.</li>
        <li><b>Khi dùng nút “Gần tôi nhất”:</b> vị trí chỉ dùng trên trình duyệt để sắp xếp quán, không gửi lưu về máy chủ.</li>
        <li><b>Cookie:</b> ghi nhớ khu vực bạn chọn; cookie đăng nhập dành cho quản trị viên.</li>
      </ul>
      <h2>2. Mục đích sử dụng</h2>
      <ul>
        <li>Phát mã ưu đãi, giúp quán đối tác xác nhận mã khi bạn sử dụng và đối soát chiết khấu.</li>
        <li>Liên hệ trao đổi hợp tác với quán/spa đã đăng ký.</li>
        <li>Thống kê số lượt bấm để cải thiện nội dung. Chúng tôi không bán dữ liệu cá nhân cho bên thứ ba.</li>
      </ul>
      <h2>3. Chia sẻ dữ liệu</h2>
      <p>
        Số điện thoại nhận voucher chỉ được quản trị viên cucre.vn xem và chỉ cung cấp cho quán phát hành ưu đãi đó khi cần xác nhận mã. Khi bạn bấm sang các sàn (Shopee, Lazada, Klook…), việc mua hàng diễn ra trên trang của sàn và theo chính sách của sàn.
      </p>
      <h2>4. Thời gian lưu trữ</h2>
      <ul>
        <li>Dữ liệu nhận voucher: tối đa 12 tháng kể từ ngày ưu đãi kết thúc, sau đó xóa hoặc ẩn danh.</li>
        <li>Đơn đăng ký hợp tác: đến khi kết thúc hợp tác hoặc khi bạn yêu cầu xóa.</li>
        <li>Thống kê lượt bấm: lưu dạng không định danh.</li>
      </ul>
      <h2>5. Quyền của bạn</h2>
      <p>Bạn có quyền được biết, truy cập, chỉnh sửa, yêu cầu xóa dữ liệu và rút lại sự đồng ý. Việc rút đồng ý không ảnh hưởng tới việc xử lý đã thực hiện trước đó.</p>
      <h2>6. Bảo mật</h2>
      <p>Dữ liệu được lưu trên máy chủ có kiểm soát truy cập, kết nối mã hóa HTTPS, trang quản trị yêu cầu đăng nhập và mật khẩu được băm.</p>
      <h2>7. Liên hệ</h2>
      <p>Mọi yêu cầu về dữ liệu cá nhân, vui lòng liên hệ {SITE.company.name} qua thông tin ở trang Hợp tác hoặc email hỗ trợ của công ty. Chúng tôi phản hồi trong vòng 72 giờ làm việc.</p>
      <h2>8. Công khai hoa hồng</h2>
      <p>{SITE.disclosure}</p>
    </article>
  );
}
