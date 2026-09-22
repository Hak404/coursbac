import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import type { ESBuildOptions } from "vite";

export default defineConfig({
  oxc: false,
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  } as ESBuildOptions,
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});