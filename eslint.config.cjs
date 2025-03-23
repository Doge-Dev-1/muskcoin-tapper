const globals = require("globals");
const js = require("@eslint/js");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");

module.exports = [
  // Ignore JSON files
  {
    ignores: ["**/*.json"]
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