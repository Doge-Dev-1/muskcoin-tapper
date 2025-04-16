const globals = require('globals');
const js = require('@eslint/js');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');

module.exports = [
  // Ignore JSON, HTML, next.config.js
  { ignores: ['**/*.json', '**/*.html', 'next.config.js'] },
  // Old vanilla JS files (script)
  {
    files: ['*.js', '**/*.js', '!pages/**/*.js', '!supabase.js', '!test-supabase.js'],
    languageOptions: { sourceType: 'script', globals: globals.browser },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-undef': 'off',
    },
  },
  // Root-level module JS files (e.g., supabase.js, test-supabase.js)
  {
    files: ['supabase.js', 'test-supabase.js'],
    languageOptions: { sourceType: 'module', globals: globals.node },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-undef': 'off',
    },
  },
  // Next.js files (module + JSX)
  {
    files: ['pages/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: globals.browser,
    },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/no-unknown-property': ['error', { ignore: ['jsx', 'global'] }],
      'no-unused-vars': 'warn',
      'no-undef': 'off',
    },
    settings: { react: { version: 'detect' } },
  },
];