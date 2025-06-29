import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: ["js/recommended"],
    plugins: {
      js,
      "unused-imports": unusedImports,
    },
    rules: {
      "no-unused-vars": ["warn", { vars: "all", args: "after-used" }],
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: globals.browser },
  },
]);
