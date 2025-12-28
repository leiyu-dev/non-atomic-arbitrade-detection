import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone', // 启用独立输出模式，用于 Docker 部署
};

export default nextConfig;
