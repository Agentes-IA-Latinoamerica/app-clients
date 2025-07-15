import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone", // Recomendado para Nixpacks o Docker
  // basePath: '/subruta', // Descomenta y configura si tu app está detrás de una subruta
};

export default nextConfig;
