// Đường dẫn dùng chung. Mọi link ra sàn đi qua /go/... (route làm ở Prompt 4).

/** Link chuyển hướng affiliate của deal: /go/123 */
export const goDeal = (id: number) => `/go/${id}`;
/** Link chuyển hướng affiliate của coupon: /go/c45 */
export const goCoupon = (id: number) => `/go/c${id}`;

export const dealPath = (slug: string) => `/deal/${slug}`;
export const placePath = (slug: string) => `/an-uong/${slug}`;

/** Thuộc tính bắt buộc cho thẻ <a> trỏ ra sàn */
export const SPONSORED_LINK = { rel: "sponsored nofollow noopener", target: "_blank" } as const;
