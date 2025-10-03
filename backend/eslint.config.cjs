// eslint.config.cjs (ESLint 9 Flat Config)
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  // Globale Ignorierliste
  { ignores: ["dist/**", "node_modules/**"] },

  // TypeScript-Regeln fürs Backend
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
        // Wenn du strengere Regeln mit Type-Infos willst, entkommentiere die nächste Zeile:
        // project: ["./tsconfig.json"],
      },
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
    },
  },
];
