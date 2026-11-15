import { Marked, type Tokens } from "marked";
import { slugify } from "@/lib/slug";

export type TocItem = { id: string; text: string; depth: 2 | 3 };

/** Dòng riêng dạng {{deal:slug-cua-deal}} trong bài viết → chèn thẻ deal */
const DEAL_EMBED = /^\{\{deal:([a-z0-9-]+)\}\}$/;

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function headingId(text: string, used: Map<string, number>) {
  const base = slugify(text.replace(/<[^>]+>/g, "")) || "muc";
  const n = used.get(base) ?? 0;
  used.set(base, n + 1);
  return n ? `${base}-${n + 1}` : base;
}

function createMarked(used: Map<string, number>) {
  return new Marked({
    gfm: true,
    breaks: false,
    renderer: {
      // Không cho HTML thô trong bài (tránh chèn mã độc) – hiện thành chữ
      html(token: Tokens.HTML | Tokens.Tag) {
        return escapeHtml(token.text);
      },
      heading(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, token: Tokens.Heading) {
        const inner = this.parser.parseInline(token.tokens);
        const depth = Math.min(Math.max(token.depth, 2), 4); // h1 trong bài hạ xuống h2 (trang đã có h1)
        const id = depth <= 3 ? headingId(token.text, used) : undefined;
        return `<h${depth}${id ? ` id="${id}"` : ""}>${inner}</h${depth}>\n`;
      },
      link(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, token: Tokens.Link) {
        const href = token.href ?? "";
        if (!/^(https?:\/\/|\/|#|mailto:)/i.test(href)) return this.parser.parseInline(token.tokens);
        const external = /^https?:\/\//i.test(href) && !href.includes("cucre.vn");
        const attrs = external ? ' target="_blank" rel="nofollow noopener"' : "";
        const title = token.title ? ` title="${escapeHtml(token.title)}"` : "";
        return `<a href="${escapeHtml(href)}"${title}${attrs}>${this.parser.parseInline(token.tokens)}</a>`;
      },
      image(token: Tokens.Image) {
        if (!/^(https?:\/\/|\/)/i.test(token.href)) return "";
        return `<img src="${escapeHtml(token.href)}" alt="${escapeHtml(token.text)}" loading="lazy" />`;
      },
    },
  });
}

export type ContentBlock = { kind: "html"; html: string } | { kind: "deal"; slug: string };

/** Tách bài thành các khối HTML và khối deal; kèm mục lục (h2, h3). */
export function renderArticle(markdown: string): { blocks: ContentBlock[]; toc: TocItem[] } {
  const used = new Map<string, number>();
  const marked = createMarked(used);
  const blocks: ContentBlock[] = [];
  let buffer: string[] = [];
  const flush = () => {
    const md = buffer.join("\n").trim();
    if (md) blocks.push({ kind: "html", html: marked.parse(md, { async: false }) });
    buffer = [];
  };
  for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const m = DEAL_EMBED.exec(line.trim());
    if (m) {
      flush();
      blocks.push({ kind: "deal", slug: m[1] });
    } else buffer.push(line);
  }
  flush();

  // Mục lục: đọc lại id đã gắn trong HTML
  const toc: TocItem[] = [];
  for (const b of blocks) {
    if (b.kind !== "html") continue;
    for (const m of b.html.matchAll(/<h([23]) id="([^"]+)">(.*?)<\/h\1>/g)) {
      toc.push({ depth: Number(m[1]) as 2 | 3, id: m[2], text: m[3].replace(/<[^>]+>/g, "") });
    }
  }
  return { blocks, toc };
}

/** Các slug deal được chèn trong bài */
export function embeddedDealSlugs(markdown: string): string[] {
  return [...markdown.matchAll(/^\{\{deal:([a-z0-9-]+)\}\}$/gm)].map((m) => m[1]);
}

/** Thời gian đọc ước tính (phút) */
export function readingMinutes(markdown: string): number {
  return Math.max(1, Math.round(markdown.split(/\s+/).filter(Boolean).length / 220));
}
