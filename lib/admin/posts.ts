import "server-only";
import { db } from "@/lib/db";

export async function postCategoryNames() {
  const rows = await db.post.groupBy({ by: ["category"], orderBy: { category: "asc" } });
  return rows.map((r) => r.category);
}
