#!/usr/bin/env node
import { FILE_PATTERNS, formatFiles, lintFiles } from '../eslint.config.mjs';

const mode = process.argv[2] || 'check';

if (!['check', 'fix'].includes(mode)) {
  console.error('Usage: node scripts/lint-format.mjs [check|fix]');
  process.exit(1);
}

const all = FILE_PATTERNS.all;

try {
  if (mode === 'check') {
    // Do not write changes: Prettier --check, ESLint no --fix
    formatFiles(all, true);
    lintFiles(all, false);
  } else {
    // Write changes: Prettier --write, ESLint --fix
    formatFiles(all, false);
    lintFiles(all, true);
  }

  console.log(`Done: ${mode}`);
} catch (_e) {
  process.exit(1);
}
