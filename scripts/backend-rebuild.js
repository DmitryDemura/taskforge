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

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function step(title, action) {
  log(`\n=== ${title} ===`, colors.yellow);
  try {
    await action();
    log(`✅ ${title} completed`, colors.green);
  } catch (error) {
    log(`❌ ${title} failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

const isWindows = process.platform === 'win32';
// platform flags not used currently

const args = process.argv.slice(2);
const skipCleanup = args.includes('--skip-cleanup');
const skipDeps = args.includes('--skip-deps');
const skipBuild = args.includes('--skip-build');
const onlyBackend = args.includes('--backend-only');
const dryRun = args.includes('--dry-run');
const parallelBuild = args.includes('--parallel-build');
const doPrune = args.includes('--prune');

if (!onlyBackend) {
  log(
    '❌ This script is backend-only. Use --backend-only, or run npm run backend:rebuild:*',
    colors.red,
  );
  process.exit(1);
}

function exec(command, options = {}) {
  if (dryRun) {
    log(`[dry-run] Would run: ${command}`, colors.cyan);

    return '';
  }

  log(`Running: ${command}`, colors.cyan);

  return execSync(command, { stdio: 'inherit', ...options });
}

function removeIfExists(p) {
  if (!fs.existsSync(p)) {
    return;
  }

  const isDir = fs.lstatSync(p).isDirectory();

  if (isDir) {
    fs.rmSync(p, { recursive: true, force: true });
    log(`Removed directory: ${p}`);
  } else {
    fs.unlinkSync(p);
    log(`Removed file: ${p}`);
  }
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;

  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

function waitForHttp(url, serviceName, maxRetries = 60, intervalMs = 2000) {
  if (dryRun) {
    log(`[dry-run] Would wait for ${serviceName} at ${url}`, colors.cyan);

    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let attempts = 0;
    const tick = () => {
      attempts++;
      try {
        let cmd;

        if (isWindows) {
          cmd = `powershell -Command "try { $r = Invoke-WebRequest -Uri '${url}' -UseBasicParsing -TimeoutSec 5; if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 400) { exit 0 } else { exit 1 } } catch { exit 1 }"`;
        } else {
          cmd = `sh -c "curl -sf -o /dev/null --max-time 5 '${url}'"`;
        }

        execSync(cmd, { stdio: 'ignore' });
        log(`✅ ${serviceName} is ready at ${url}`, colors.green);
        resolve();

        return;
      } catch {
        if (attempts >= maxRetries) {
          reject(new Error(`${serviceName} not ready after ${maxRetries} attempts`));

          return;
        }

        setTimeout(tick, intervalMs);
      }
    };
    setTimeout(tick, intervalMs);
  });
}

(async () => {
  const startTime = Date.now();
  log('🚀 TaskForge Rebuild Started', colors.bright);

  if (dryRun) {
    log('🧪 DRY-RUN MODE: no files, images, containers or deps will be changed.', colors.yellow);
  }

  if (parallelBuild) {
    log('🧵 Parallel build enabled (docker compose build --parallel)', colors.yellow);
  }

  log(
    doPrune
      ? '🧹 Global prunes enabled by --prune.'
      : '🛡️ Global prunes disabled. Use --prune to enable.',
    colors.yellow,
  );

  // 1) Stop & remove containers
  if (!skipCleanup) {
    await step('1) Stop and remove containers', () => {
      exec(
        'docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans',
      );
    });
  } else {
    log('⚡ Skipping container cleanup', colors.yellow);
  }

  // 2) Clean node_modules (backend only)
  if (!skipCleanup) {
    await step('2) Clean node_modules (backend)', () => {
      removeIfExists('backend/node_modules');
    });
  }

  // 3) Remove package-locks (backend only)
  if (!skipCleanup) {
    await step('3) Remove package-locks (backend)', () => {
      removeIfExists('backend/package-lock.json');
    });
  }

  // 4) Remove Docker images (api) + optional prunes
  if (!skipCleanup) {
    await step('4) Remove Docker images (api)', () => {
      try {
        exec('docker image rm taskforge-api', { stdio: 'pipe' });
      } catch (_e) {
        void 0;
      }

      if (doPrune) {
        try {
          exec('docker image prune -f', { stdio: 'pipe' });
        } catch (_e) {
          void 0;
        }
        try {
          exec('docker builder prune -f', { stdio: 'pipe' });
        } catch (_e) {
          void 0;
        }
      }
    });
  }

  // 5) Install dependencies (root + backend)
  if (!skipDeps) {
    await step('5) Install dependencies (root)', () => {
      removeIfExists('node_modules');
      removeIfExists('package-lock.json');
      exec('npm install');
    });
    await step('5.1) Install dependencies (backend)', () => {
      removeIfExists('backend/node_modules');
      removeIfExists('backend/package-lock.json');
      exec('npm install --prefix backend');
    });
  } else {
    log('⚡ Skipping dependency installation', colors.yellow);
  }

  // 6) Build Docker image (api)
  if (!skipBuild) {
    await step('6) Build Docker image (api)', () => {
      const composeFiles = '-f docker-compose.yml -f docker-compose.dev.yml';
      const parallel = parallelBuild ? '--parallel ' : '';
      exec(`docker compose ${composeFiles} build ${parallel} --no-cache api`);
    });
  } else {
    log('⚡ Skipping Docker image build', colors.yellow);
  }

  // 7) Start services
  await step('7) Start services (db, redis, api)', () => {
    const composeFiles = '-f docker-compose.yml -f docker-compose.dev.yml';
    exec(`docker compose ${composeFiles} up -d db redis api`);
  });

  // 8) Wait for DB, Redis, API
  await step('8) Verify services readiness', async () => {
    // DB
    let tries = 30;
    let ok = false;
    while (tries-- > 0 && !ok) {
      try {
        exec(
          'docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T db pg_isready -U taskforge',
          { stdio: 'pipe' },
        );
        ok = true;
      } catch {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    if (!ok) {
      throw new Error('Database failed to become ready');
    }

    // Redis
    tries = 30;
    ok = false;
    while (tries-- > 0 && !ok) {
      try {
        exec(
          'docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T redis redis-cli ping',
          { stdio: 'pipe' },
        );
        ok = true;
      } catch {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    if (!ok) {
      throw new Error('Redis failed to become ready');
    }

    // API (health) — allow more time for the first in-container deps install
    await waitForHttp('http://localhost:2999/api/health', 'API', 180, 2000);

    // Generate Prisma client in container to ensure correct platform binary
    exec(
      'docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api npx prisma generate',
      { stdio: 'pipe' },
    );
  });

  // 9) Run Prisma migrations
  await step('9) Run Prisma migrations', () => {
    exec(
      'docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api npx prisma migrate deploy',
    );
  });

  const buildTime = Date.now() - startTime;
  log(
    `\n🎉 Build ${dryRun ? '(dry-run) ' : ''}completed in ${formatTime(buildTime)}!`,
    colors.green,
  );
  log(
    `\n📦 Summary: cleanup=${!skipCleanup}, deps=${!skipDeps}, build=${!skipBuild}, parallel-build=${parallelBuild}, prune=${doPrune}, dry-run=${dryRun}`,
    colors.bright,
  );
})().catch((e) => {
  log(`❌ Script failed: ${e.message}`, colors.red);
  process.exit(1);
});
