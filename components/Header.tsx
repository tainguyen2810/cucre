import { cookies } from "next/headers";
import { MessageCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { MainNav } from "@/components/MainNav";
import { RegionSelect } from "@/components/RegionSelect";
import { SearchBox } from "@/components/SearchBox";
import { buttonClass } from "@/components/ui/Button";
import { REGION_COOKIE, SITE, parseRegion } from "@/lib/site";

export async function Header() {
  const region = parseRegion((await cookies()).get(REGION_COOKIE)?.value);
  const zalo = SITE.zaloUrl || "/";
  const external = zalo.startsWith("http");

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-site flex-col gap-3 px-4 pt-3 pb-2 md:px-6 md:pt-4">
        <div className="flex items-center gap-3 md:gap-4">
          <Logo className="mr-auto md:mr-2" />
          <SearchBox className="hidden flex-1 md:block md:max-w-[560px]" />
          <div className="md:hidden">
            <RegionSelect value={region} compact id="region-mobile" />
          </div>
          <div className="hidden md:block">
            <RegionSelect value={region} id="region-desktop" />
          </div>
          <a
            href={zalo}
            {...(external ? { target: "_blank", rel: "noopener" } : {})}
            className={buttonClass("dark", "md", "px-3 md:ml-auto md:px-[18px]")}
          >
            <MessageCircle className="size-4" aria-hidden />
            <span className="sr-only md:not-sr-only">Nhận deal qua Zalo</span>
          </a>
        </div>
        <SearchBox className="md:hidden" />
        <MainNav />
      </div>
    </header>
  );
}
