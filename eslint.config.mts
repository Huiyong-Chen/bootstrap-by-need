import jsESLint from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tsESLint from "typescript-eslint";

export default defineConfig([
  {
    ignores: ["dist/**", "node_modules/**", "**/*.d.ts"],
  },
  jsESLint.configs.recommended,
  ...tsESLint.configs.recommended,
  {
    files: ["src/**/*.{ts,mts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser, // 注入浏览器变量 (window, document)
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // 允许 any，但警告
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // 解决 strict ESM 下未使用的变量问题
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],

      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
    },
  },
  prettierConfig,
]);
