import type { Metadata } from "next";
import { PostForm } from "@/components/admin/PostForm";
import { requireAdmin } from "@/lib/admin/auth";
import { postCategoryNames } from "@/lib/admin/posts";

export const metadata: Metadata = { title: "Viết bài" };

export default async function NewPostPage() {
  await requireAdmin();
  const categories = await postCategoryNames();
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Viết bài</h1>
      <PostForm categories={categories} values={{ title: "", slug: "", category: "Nên mua gì", excerpt: "", content: "", coverImage: null, relatedDeals: "", status: "draft", publishedAt: "" }} />
    </div>
  );
}
