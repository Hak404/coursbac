/** @type {import('next').NextConfig} */
import path from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig = {
  reactStrictMode: false,
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  distDir: process.env.NODE_ENV === "production" ? ".next-prod" : ".next-dev",
};

export default nextConfig;