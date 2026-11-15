import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a href="#noi-dung" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-white">
        Bỏ qua đến nội dung
      </a>
      <Header />
      <main id="noi-dung" className="mx-auto w-full max-w-site flex-1 px-4 py-6 md:px-6">
        {children}
      </main>
      <Footer />
    </>
  );
}
