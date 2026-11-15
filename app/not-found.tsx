import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LinkButton } from "@/components/ui/Button";

// Trang 404 chung (URL không tồn tại, hoặc notFound() trong trang)
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-site flex-1 flex-col items-start gap-4 px-4 py-16 md:px-6">
        <p className="text-sm font-bold text-brand">Lỗi 404</p>
        <h1 className="text-page font-extrabold">Không tìm thấy trang</h1>
        <p className="max-w-lg text-muted">
          Trang bạn tìm có thể đã bị gỡ hoặc đường dẫn bị sai. Xem các deal đang hot hoặc mã giảm giá hôm nay nhé.
        </p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/">Về trang chủ</LinkButton>
          <LinkButton href="/ma-giam-gia" variant="light">
            Mã giảm giá
          </LinkButton>
        </div>
      </main>
      <Footer />
    </>
  );
}
