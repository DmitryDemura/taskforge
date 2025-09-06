import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'generated/**', '*.js', '*.cjs'],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: [path.join(__dirname, 'tsconfig.json')],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
  },

  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.spec.ts', 'test/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: [path.join(__dirname, 'tsconfig.spec.json')],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
  },
];
