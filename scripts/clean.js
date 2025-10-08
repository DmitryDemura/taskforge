#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ===== Console colors =====
const C = {
  r: '\x1b[0m',
  b: '\x1b[1m',
  red: '\x1b[31m',
  grn: '\x1b[32m',
  yel: '\x1b[33m',
  cya: '\x1b[36m',
};
const log = (msg, color = C.r) => console.log(color + msg + C.r);

// ===== Flags =====
// --keep-lock      -> do not delete package-lock.json
// --no-docker      -> skip Docker cleanup
// --git            -> use `git clean -xfd` instead of walking the filesystem (fast but aggressive)
// --dry            -> only show what would be deleted
const argv = process.argv.slice(2);
const KEEP_LOCK = argv.includes('--keep-lock');
const NO_DOCKER = argv.includes('--no-docker');
const USE_GIT = argv.includes('--git');
const DRY = argv.includes('--dry');

// What we delete
const DIRS = new Set([
  'node_modules',
  'dist',
  '.nuxt',
  '.output',
  '.turbo',
  '.angular',
  '.next',
  '.vite',
  'coverage',
  'build',
  '.cache',
]);
const FILES = new Set(['package-lock.json']);

// Where we walk (repo root plus common monorepo folders)
const ROOT = process.cwd();
const ENTRY_DIRS = [
  ROOT,
  path.join(ROOT, 'backend'),
  path.join(ROOT, 'frontend'),
  path.join(ROOT, 'apps'),
  path.join(ROOT, 'packages'),
];

// Directories to skip during traversal
const SKIP_DIRS = new Set(['.git', '.husky', '.idea', '.vscode']);

// Reliable removal with retries for Windows
function rmSafe(p, isDir) {
  if (DRY) {
    log(`[dry] remove ${isDir ? 'dir ' : 'file'}: ${p}`, C.cya);

    return;
  }

  try {
    if (isDir) {
      fs.rmSync(p, { recursive: true, force: true, maxRetries: 10, retryDelay: 120 });
    } else {
      fs.rmSync(p, { force: true, maxRetries: 5, retryDelay: 80 });
    }

    log(`✓ removed ${isDir ? 'dir ' : 'file'}: ${p}`, C.grn);
  } catch (e) {
    log(`! skip ${p} (${e.code || e.message})`, C.yel);
  }
}

function walkAndCollect(startDir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(startDir, { withFileTypes: true });
  } catch {
    return out;
  }

  for (const e of entries) {
    const full = path.join(startDir, e.name);

    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) {
        continue;
      }

      if (DIRS.has(e.name)) {
        // Found target directory - add it and do not descend into it
        out.push({ path: full, isDir: true });
        continue;
      }

      // Continue recursion
      walkAndCollect(full, out);
    } else if (FILES.has(e.name) && !KEEP_LOCK) {
      out.push({ path: full, isDir: false });
    }
  }

  return out;
}

function cleanViaGit() {
  const excludes = [
    // Keep local config files if present
    '!.env',
    '!.env.local',
    '!/.vscode/',
  ];
  const cmd = `git clean -xfd ${excludes.map((e) => `-e "${e}"`).join(' ')}`;

  if (DRY) {
    log(`[dry] would run: ${cmd}`, C.cya);

    return;
  }

  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch {
    // ignore
  }
}

function cleanDocker() {
  const down =
    'docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans';
  const pruneImg = 'docker image prune -f';
  const pruneBld = 'docker builder prune -f';

  for (const cmd of [down, pruneImg, pruneBld]) {
    if (DRY) {
      log(`[dry] would run: ${cmd}`, C.cya);
      continue;
    }

    try {
      execSync(cmd, { stdio: 'pipe' });
      log(`✓ docker: ${cmd}`, C.grn);
    } catch {
      log(`! docker failed (ok) → ${cmd}`, C.yel);
    }
  }
}

function main() {
  log('🧹 TaskForge Clean', C.b);

  if (USE_GIT) {
    log('mode: git clean -xfd', C.cya);
    cleanViaGit();
  } else {
    log('mode: filesystem walk', C.cya);

    const targets = [];
    for (const base of ENTRY_DIRS) {
      if (!fs.existsSync(base)) {
        continue;
      }

      // If base is apps/ or packages/, iterate through their subdirectories
      const baseName = path.basename(base);

      if (['apps', 'packages'].includes(baseName)) {
        let items = [];

        try {
          items = fs.readdirSync(base, { withFileTypes: true });
        } catch {
          //
        }

        for (const it of items) {
          if (it.isDirectory()) {
            walkAndCollect(path.join(base, it.name), targets);
          }
        }
      } else {
        walkAndCollect(base, targets);
      }
    }

    // Remove deepest paths first to avoid conflicts
    targets
      .sort((a, b) => b.path.split(path.sep).length - a.path.split(path.sep).length)
      .forEach((t) => rmSafe(t.path, t.isDir));
  }

  if (!NO_DOCKER) {
    log('\n🐳 Docker cleanup', C.b);
    cleanDocker();
  } else {
    log('\n🐳 Docker cleanup: skipped by --no-docker', C.yel);
  }

  log('\n🎉 Done!', C.grn);
  log('\nTips:', C.b);
  log('  • npm run reinstall    # full dependency reinstall', C.cya);
  log('  • node scripts/clean.js --git --no-docker', C.cya);
  log('  • node scripts/clean.js --keep-lock', C.cya);
}

main();
