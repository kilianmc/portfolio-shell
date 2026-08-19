import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

// Flat ESLint config for this React 19 + Vite TypeScript project.
// Order matters: `eslint-config-prettier` is last so it disables any stylistic
// rules that would conflict with Prettier's formatting.
export default tseslint.config(
  {
    ignores: ['dist/**', 'dist-ssr/**', 'node_modules/**', '*.local'],
  },
  js.configs.recommended,
  // typescript-eslint parser + recommended rules, scoped to TS/TSX only.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommended],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...react.configs.recommended.rules,
      // New JSX transform: React need not be in scope for JSX.
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      // Explicitly off (also handled by jsx-runtime) for the new transform.
      'react/react-in-jsx-scope': 'off',
      // Types replace PropTypes in this TypeScript project.
      'react/prop-types': 'off',
    },
  },
  {
    // Node-context files: build/tool config.
    files: ['*.config.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  prettier,
);
