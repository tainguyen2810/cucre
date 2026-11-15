import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tắt Cache Components để dữ liệu đọc từ MySQL được render động theo từng request,
  // đơn giản hơn cho một người quản trị. Có thể bật lại khi cần tối ưu.
  cacheComponents: false,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
