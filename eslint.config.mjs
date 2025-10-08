/**
 * Unified ESLint Configuration with CLI Tools
 *
 * This file provides both ESLint configuration and CLI utilities
 * for linting and formatting across the entire monorepo.
 */

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import { execSync } from 'child_process';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const tsconfigRootDir = currentDir;

// ESLint Configuration
const eslintConfig = [
  // Global ignores
  {
    ignores: [
      // Dependencies and build outputs
      'node_modules/**',
      '**/node_modules/**',
      'dist/**',
      '**/dist/**',
      'build/**',
      '**/build/**',
      'coverage/**',
      '**/coverage/**',
      '.nyc_output/**',
      'tmp/**',
      'temp/**',

      // Frontend specific
      'apps/vue/.nuxt/**',
      'apps/vue/.output/**',
      'apps/vue/.cache/**',

      // Backend specific
      'backend/src/**/__generated__/**',

      // File types to ignore
      '**/*.vue',
      '**/*.d.ts',

      // Config and lock files
      '**/package-lock.json',
      '**/yarn.lock',
      '**/pnpm-lock.yaml',
    ],
  },

  // Base configurations
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig, // Disables ESLint rules that conflict with Prettier

  // Global rules for all JS/TS files
  {
    files: ['**/*.{js,mjs,cjs,ts,cts,mts,tsx}'],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Prettier integration (disabled - we check formatting separately)
      // 'prettier/prettier': 'error',

      // Code style
      curly: ['error', 'all'],
      'brace-style': ['error', '1tbs', { allowSingleLine: false }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'time', 'timeEnd'] }],
      'prettier/prettier': 'warn',
      'no-unused-vars': 'off', // Use TypeScript version instead
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Spacing and formatting (minimal rules since Prettier handles most)
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'if' },
        { blankLine: 'always', prev: 'if', next: '*' },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: '*', next: 'function' },
        { blankLine: 'always', prev: 'function', next: '*' },
      ],
    },
  },

  // Frontend specific configuration
  {
    files: ['apps/vue/**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        // Nuxt 3 globals
        console: 'readonly',
        process: 'readonly',
        $fetch: 'readonly',
        navigateTo: 'readonly',
        useRoute: 'readonly',
        useRouter: 'readonly',
        ref: 'readonly',
        reactive: 'readonly',
        computed: 'readonly',
        watch: 'readonly',
        onMounted: 'readonly',
        nextTick: 'readonly',
        defineNuxtConfig: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console in frontend for debugging
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Backend specific configuration
  {
    files: ['apps/backend/**/*.{ts,cts,mts}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['apps/backend/tsconfig.json', 'apps/backend/tsconfig.build.json'],
        tsconfigRootDir,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unsafe-call': 'off', // Too strict for NestJS
      '@typescript-eslint/no-unsafe-member-access': 'off', // Too strict for NestJS
      '@typescript-eslint/no-unsafe-assignment': 'off', // Too strict for NestJS
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',

      // NestJS specific
      'no-console': 'off', // Allow console.log in backend
    },
  },

  // Scripts and configuration files
  {
    files: ['scripts/**/*.{js,mjs,cjs}', '*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script', // Scripts often use CommonJS
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off', // Allow require in scripts
      'no-console': 'off', // Allow console in scripts
    },
  },

  // Test files
  {
    files: ['**/*.{test,spec}.{js,ts}', '**/test/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
];

// Export ESLint configuration as default
export default eslintConfig;

// CLI Tools and Utilities
export const CONFIG_PATHS = {
  eslint: path.join(currentDir, 'eslint.config.mjs'),
  prettier: path.join(currentDir, '.prettierrc.json'),
  prettierIgnore: path.join(currentDir, '.prettierignore'),
};

export const FILE_PATTERNS = {
  all: '**/*.{js,mjs,cjs,ts,cts,mts,tsx,vue,json,md,css,scss,yml,yaml}',
  js: '**/*.{js,mjs,cjs}',
  ts: '**/*.{ts,cts,mts,tsx}',
  vue: '**/*.vue',
  frontend: 'apps/vue/**/*.{js,ts,vue}',
  backend: 'apps/backend/**/*.{ts,cts,mts}',
  scripts: 'scripts/**/*.{js,mjs,cjs}',
  config: '*.{js,mjs,cjs,ts,json}',
  docs: '**/*.md',
  styles: '**/*.{css,scss}',
  data: '**/*.{json,yml,yaml}',
};

export function lintFiles(pattern = FILE_PATTERNS.all, fix = false) {
  const fixFlag = fix ? '--fix' : '';
  const command = `npx eslint ${pattern} --config ${CONFIG_PATHS.eslint} ${fixFlag}`;

  try {
    execSync(command, { stdio: 'inherit', cwd: currentDir });
    console.log(`✅ Linting completed for: ${pattern}`);
  } catch (error) {
    console.error(`❌ Linting failed for: ${pattern}`);
    throw error;
  }
}

export function formatFiles(pattern = FILE_PATTERNS.all, check = false) {
  const action = check ? '--check' : '--write';
  // Use dot as pattern for all files to avoid Windows glob issues
  const actualPattern = pattern === FILE_PATTERNS.all ? '.' : pattern;
  const command = `npx prettier ${action} "${actualPattern}" --config ${CONFIG_PATHS.prettier} --ignore-path ${CONFIG_PATHS.prettierIgnore}`;

  try {
    execSync(command, { stdio: 'inherit', cwd: currentDir });
    console.log(`✅ Formatting completed for: ${pattern}`);
  } catch (error) {
    console.error(`❌ Formatting failed for: ${pattern}`);
    throw error;
  }
}

export function lintAndFormat(pattern = FILE_PATTERNS.all, fix = true) {
  console.log(`🔍 Running lint and format for: ${pattern}`);

  try {
    // First format the files
    formatFiles(pattern, false);

    // Then lint them
    lintFiles(pattern, fix);

    console.log(`✅ Lint and format completed successfully for: ${pattern}`);
  } catch (error) {
    console.error(`❌ Lint and format failed for: ${pattern}`);
    throw error;
  }
}

// Predefined commands for different parts of the project
export const commands = {
  // Lint commands
  lintAll: () => lintFiles(FILE_PATTERNS.all),
  lintFrontend: () => lintFiles(FILE_PATTERNS.frontend),
  lintBackend: () => lintFiles(FILE_PATTERNS.backend),
  lintScripts: () => lintFiles(FILE_PATTERNS.scripts),

  // Format commands
  formatAll: () => formatFiles(FILE_PATTERNS.all),
  formatFrontend: () => formatFiles(FILE_PATTERNS.frontend),
  formatBackend: () => formatFiles(FILE_PATTERNS.backend),
  formatScripts: () => formatFiles(FILE_PATTERNS.scripts),
  formatDocs: () => formatFiles(FILE_PATTERNS.docs),

  // Combined commands
  fixAll: () => lintAndFormat(FILE_PATTERNS.all),
  fixFrontend: () => lintAndFormat(FILE_PATTERNS.frontend),
  fixBackend: () => lintAndFormat(FILE_PATTERNS.backend),
  fixScripts: () => lintAndFormat(FILE_PATTERNS.scripts),

  // Check commands (no fixes)
  checkAll: () => {
    formatFiles(FILE_PATTERNS.all, true);
    lintFiles(FILE_PATTERNS.all, false);
  },
  checkFrontend: () => {
    formatFiles(FILE_PATTERNS.frontend, true);
    lintFiles(FILE_PATTERNS.frontend, false);
  },
  checkBackend: () => {
    formatFiles(FILE_PATTERNS.backend, true);
    lintFiles(FILE_PATTERNS.backend, false);
  },
};

// CLI interface
if (process.argv[1] && process.argv[1].endsWith('eslint.config.mjs')) {
  const command = process.argv[2];
  const pattern = process.argv[3];

  if (!command) {
    console.log(`
Usage: node eslint.config.mjs <command> [pattern]

Commands:
  lint [pattern]     - Lint files
  format [pattern]   - Format files
  fix [pattern]      - Lint and format files
  check [pattern]    - Check formatting and linting (no fixes)

Predefined commands:
  ${Object.keys(commands).join(', ')}

Examples:
  node eslint.config.mjs fix
  node eslint.config.mjs lint "backend/**/*.ts"
  node eslint.config.mjs formatAll
  node eslint.config.mjs checkFrontend
`);
    process.exit(1);
  }

  try {
    if (commands[command]) {
      commands[command]();
    } else {
      switch (command) {
        case 'lint':
          lintFiles(pattern);
          break;
        case 'format':
          formatFiles(pattern);
          break;
        case 'fix':
          lintAndFormat(pattern);
          break;
        case 'check':
          formatFiles(pattern || FILE_PATTERNS.all, true);
          lintFiles(pattern || FILE_PATTERNS.all, false);
          break;
        default:
          console.error(`Unknown command: ${command}`);
          process.exit(1);
      }
    }
  } catch (_error) {
    process.exit(1);
  }
}
