// Đường dẫn dùng chung. Mọi link ra sàn đi qua /go/...

/** Link chuyển hướng affiliate của deal: /go/123 */
export const goDeal = (id: number) => `/go/${id}`;
/** Link chuyển hướng affiliate của coupon: /go/c45 */
export const goCoupon = (id: number) => `/go/c${id}`;

export const dealPath = (slug: string) => `/deal/${slug}`;
export const placePath = (slug: string) => `/an-uong/${slug}`;
/** /ma-giam-gia hoặc /ma-giam-gia/shopee */
export const couponListPath = (platformSlug?: string) => (platformSlug ? `/ma-giam-gia/${platformSlug}` : "/ma-giam-gia");

/** Trang danh sách của từng mảng */
export const SEGMENT_PAGE: Record<string, { href: string; label: string }> = {
  product: { href: "/gia-re", label: "Giá rẻ" },
  digital: { href: "/ky-thuat-so", label: "Kỹ thuật số" },
  travel: { href: "/du-lich", label: "Du lịch" },
  local: { href: "/an-uong", label: "Ăn uống & Spa" },
};

/** Thuộc tính bắt buộc cho thẻ <a> trỏ ra sàn */
export const SPONSORED_LINK = { rel: "sponsored nofollow noopener", target: "_blank" } as const;
