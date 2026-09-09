import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // قراءة الرابط من متغيرات البيئة، وإذا لم يجده (مثل حالة السيرفر الأونلاين إن لم تضف المتغير)، سيستخدم الرابط الفعلي كاحتياط
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.mebabl.com";

    return [
      {
        source: "/api/platform/:path*",
        destination: `${apiUrl}/api/:path*`, // سيصبح محلياً: http://localhost:5094/api/:path*
      },
    ];
  },
};

export default nextConfig;