/** Thông báo ngắn sau khi lưu (đọc từ ?ok=...) */
const MESSAGES: Record<string, string> = {
  saved: "Đã lưu.",
  created: "Đã tạo.",
  deleted: "Đã xóa.",
  copied: "Đã nhân bản – đang sửa bản sao (trạng thái Nháp).",
  password: "Đã đổi mật khẩu.",
};

export function Flash({ ok }: { ok?: string }) {
  const text = ok ? MESSAGES[ok] : undefined;
  if (!text) return null;
  return (
    <p role="status" className="rounded-lg bg-ok-bg px-3 py-2.5 text-sm font-semibold text-ok">
      {text}
    </p>
  );
}
