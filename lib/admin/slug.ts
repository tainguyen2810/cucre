import "server-only";
import { slugify } from "@/lib/slug";

/** Tạo slug không trùng: thêm -2, -3... nếu đã tồn tại */
export async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  const root = slugify(base) || "muc-moi";
  let slug = root;
  for (let i = 2; await exists(slug); i++) slug = `${root}-${i}`.slice(0, 191);
  return slug;
}
