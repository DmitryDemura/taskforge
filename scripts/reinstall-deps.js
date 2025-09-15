#!/usr/bin/env node
const { execSync } = require('child_process');
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

function exec(cmd, cwd) {
  log(`Running: ${cmd}${cwd ? ` (cwd=${cwd})` : ''}`, colors.cyan);
  execSync(cmd, { stdio: 'inherit', cwd: cwd || process.cwd() });
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

  const cmd = hadLock ? 'npm ci' : 'npm install';
  const prefix = dir ? `${dir}: ` : '';
  log(`${prefix}Installing with ${cmd} (lockfile ${hadLock ? 'present' : 'absent'})`, colors.cyan);
  exec(cmd, dir);
}

function main() {
  log('Reinstalling dependencies (root, backend, frontend)', colors.bright);

  // Root
  installDeps();

  // Backend
  installDeps('backend');

  // Frontend
  installDeps('frontend');

  log('Dependencies reinstalled successfully', colors.green);
}

main();
