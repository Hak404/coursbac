import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      ".next-dev/**",
      ".next-prod/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "lib/generated/**",
    ],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react/no-children-prop": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;