export type QueryParams = Record<string, string | string[] | undefined>;

/** Lấy một giá trị chuỗi từ searchParams */
export function param(params: QueryParams, key: string): string | undefined {
  const v = params[key];
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.trim() ? s.trim() : undefined;
}

/** Số trang hợp lệ (>= 1) */
export function pageParam(params: QueryParams): number {
  const n = Number(param(params, "page"));
  return Number.isInteger(n) && n > 1 ? Math.min(n, 1000) : 1;
}

/** Dựng URL với tham số mới; giá trị rỗng/undefined bị bỏ. Đổi bộ lọc thì về trang 1. */
export function hrefWith(basePath: string, current: Record<string, string | undefined>, changes: Record<string, string | undefined>) {
  const merged = { ...current, page: undefined, ...changes };
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
