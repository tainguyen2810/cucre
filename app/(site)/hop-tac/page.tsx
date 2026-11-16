import type { Metadata } from "next";
import { BadgePercent, ChartColumn, Megaphone, Wallet } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { TURNSTILE_SITE_KEY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hợp tác cho quán ăn, spa – thêm khách không mất phí đăng",
  description: "Đăng ưu đãi của quán ăn, cà phê, spa lên cucre.vn miễn phí. Chỉ trả chiết khấu khi khách thực sự dùng mã. Đăng ký trong 2 phút.",
  alternates: { canonical: "/hop-tac" },
};

const BENEFITS = [
  { icon: Wallet, title: "Không mất phí đăng", text: "Chỉ trả chiết khấu theo số mã khách đã dùng tại quán." },
  { icon: Megaphone, title: "Tiếp cận khách gần quán", text: "Khách lọc theo quận và vị trí, thấy quán trên bản đồ." },
  { icon: BadgePercent, title: "Bạn tự chọn ưu đãi", text: "Số lượng mã, thời gian, điều kiện áp dụng do quán quyết định." },
  { icon: ChartColumn, title: "Đối soát rõ ràng", text: "Mỗi mã gắn với một số điện thoại; đối soát cuối tháng minh bạch." },
];

const STEPS = ["Gửi đăng ký bên dưới", "cucre.vn gọi lại, thống nhất ưu đãi và chiết khấu", "Quán lên trang, khách nhận mã bằng số điện thoại", "Khách đưa mã khi thanh toán – cuối tháng đối soát"];

export default function PartnerPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex max-w-3xl flex-col gap-2">
        <h1 className="text-[28px] leading-tight font-extrabold md:text-page">Hợp tác cùng cucre.vn</h1>
        <p className="text-lg text-muted">Dành cho quán ăn, cà phê, buffet, spa, massage muốn có thêm khách mới mà không tốn tiền quảng cáo trước.</p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4">
            <Icon className="size-6 text-brand" aria-hidden />
            <p className="font-bold">{title}</p>
            <p className="text-sm text-muted">{text}</p>
          </li>
        ))}
      </ul>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section aria-labelledby="quy-trinh" className="flex flex-col gap-3">
          <h2 id="quy-trinh" className="text-section font-extrabold">Cách hoạt động</h2>
          <ol className="flex flex-col gap-3">
            {STEPS.map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
                <span className="pt-1">{s}</span>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="dang-ky" className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 md:p-6">
          <h2 id="dang-ky" className="text-section font-extrabold">Đăng ký hợp tác</h2>
          <LeadForm turnstileSiteKey={TURNSTILE_SITE_KEY} />
        </section>
      </div>
    </div>
  );
}
