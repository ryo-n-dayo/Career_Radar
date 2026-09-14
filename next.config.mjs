/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // OpenNext が workerd 向けに Prisma Client をパッチできるよう、バンドル対象から外す
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  experimental: {
    // barrel import を実際に使うアイコン/関数だけに絞り、コンパイル対象を大幅に削減する
    optimizePackageImports: ["lucide-react", "date-fns"]
  }
};

export default nextConfig;

// next dev でも Cloudflare のバインディング（D1 など）をローカルの miniflare 経由で使えるようにする
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
