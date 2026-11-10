import { localOriginRedirects } from "./src/lib/auth/origin.js";
const nextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["argon2"],
  async redirects() {
    return localOriginRedirects(process.env.APP_ORIGIN);
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default nextConfig;
