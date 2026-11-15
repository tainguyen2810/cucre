/** Bỏ dấu tiếng Việt: "Bún bò Huế" -> "Bun bo Hue". Dùng cho slug và cột tìm kiếm không dấu. */
export function removeVietnameseTones(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/** Tạo slug URL: "SSD NVMe 512GB – Giảm 30%" -> "ssd-nvme-512gb-giam-30". */
export function slugify(input: string): string {
  return removeVietnameseTones(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/** Chuỗi dùng cho cột tìm kiếm: chữ thường, không dấu, gộp khoảng trắng. */
export function toSearchText(input: string): string {
  return removeVietnameseTones(input).toLowerCase().replace(/\s+/g, " ").trim();
}
