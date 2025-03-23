import globals from "globals";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // Config file itself as module
  {
    files: ["eslint.config.mjs"],
    languageOptions: { sourceType: "module" }
  },
  // Old vanilla JS files (script)
  {
    files: ["*.js", "**/*.js", "!pages/**/*.js"],
    languageOptions: { sourceType: "script" }
  },
  // Next.js files (module + JSX)
  {
    files: ["pages/**/*.js"],
    languageOptions: {
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    plugins: {
      react,
      "react-hooks": reactHooks
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/prop-types": "off"
    },
    settings: { react: { version: "detect" } }
  },
  // Shared browser globals
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: globals.browser }
  },
  // Shared rules
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "warn",
      "no-undef": "off"
    }
  }
];