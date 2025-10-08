#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function runNpm(args, cwd) {
  const display = `npm ${args.join(' ')}`;
  log(`Running: ${display}${cwd ? ` (cwd=${cwd})` : ''}`, colors.cyan);

  const npmCli =
    process.env.npm_execpath ||
    (() => {
      try {
        // Fallback when script is invoked outside npm run; keeps execution shell-free
        return require.resolve('npm/bin/npm-cli.js');
      } catch (_err) {
        return null;
      }
    })();

  if (!npmCli) {
    throw new Error('Unable to locate npm CLI (npm_execpath not set)');
  }

  const result = spawnSync(process.execPath, [npmCli, ...args], {
    stdio: 'inherit',
    cwd: cwd || process.cwd(),
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`Command failed: ${display}`);
  }
}

function removePath(p) {
  if (!fs.existsSync(p)) {
    return;
  }

  const isDir = fs.lstatSync(p).isDirectory();

  if (isDir) {
    // Be robust on Windows: retry ENOTEMPTY/EBUSY/EPERM
    try {
      fs.rmSync(p, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    } catch (err) {
      // Final fallback single retry after brief delay
      if (['ENOTEMPTY', 'EBUSY', 'EPERM'].includes(err.code)) {
        // Synchronous sleep via Atomics to avoid async refactor
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 150);
        fs.rmSync(p, { recursive: true, force: true, maxRetries: 10, retryDelay: 150 });
      } else {
        throw err;
      }
    }
    log(`Removed directory: ${p}`, colors.green);
  } else {
    fs.unlinkSync(p);
    log(`Removed file: ${p}`, colors.green);
  }
}

// hasLock helper removed (unused)

function installDeps(dir) {
  const lockPath = dir ? `${dir}/package-lock.json` : 'package-lock.json';
  const hadLock = fs.existsSync(lockPath);
  const nmPath = dir ? `${dir}/node_modules` : 'node_modules';

  // Always clean node_modules; preserve lockfile if present to allow npm ci
  removePath(nmPath);

  if (!hadLock) {
    removePath(lockPath);
  }

  const args = hadLock ? ['ci'] : ['install'];
  const prefix = dir ? `${dir}: ` : '';
  log(
    `${prefix}Installing with npm ${args[0]} (lockfile ${hadLock ? 'present' : 'absent'})`,
    colors.cyan,
  );
  runNpm(args, dir);
}

function main() {
  log('Reinstalling dependencies (root, apps/backend, apps/vue)', colors.bright);

  // Root
  installDeps();

  // Backend
  installDeps('apps/backend');

  // Frontend
  installDeps('apps/vue');

  log('Dependencies reinstalled successfully', colors.green);
}

main();
