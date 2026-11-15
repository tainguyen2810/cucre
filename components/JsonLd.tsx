/** Chèn dữ liệu có cấu trúc schema.org; thay "<" để tránh chèn mã độc vào thẻ script. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
