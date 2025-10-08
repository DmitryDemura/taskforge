const { execSync, exec: execAsync } = require('child_process');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

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

const args = process.argv.slice(2);

const skipCleanup = args.includes('--skip-cleanup');
const skipDeps = args.includes('--skip-deps');
const skipBuild = args.includes('--skip-build');
const onlyFrontend = args.includes('--frontend-only');
const onlyBackend = args.includes('--backend-only');
const dryRun = args.includes('--dry-run');
const parallelBuild = args.includes('--parallel-build');
const doPrune = args.includes('--prune'); // IMPORTANT: global prune now runs only when this flag is provided

if (onlyFrontend && onlyBackend) {
  log('❌ Use either --frontend-only or --backend-only, not both.', colors.red);
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

function removeIfExists(filePath) {
  const exists = fs.existsSync(filePath);

  if (!exists) {
    return;
  }

  const isDir = fs.lstatSync(filePath).isDirectory();

  if (dryRun) {
    log(`[dry-run] Would remove ${isDir ? 'directory' : 'file'}: ${filePath}`);

    return;
  }

  if (isDir) {
    fs.rmSync(filePath, { recursive: true, force: true });
    log(`Removed directory: ${filePath}`);
  } else {
    fs.unlinkSync(filePath);
    log(`Removed file: ${filePath}`);
  }
}

function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
}

function waitForService(url, serviceName, maxRetries = 30, retryInterval = 2000) {
  if (dryRun) {
    log(
      `[dry-run] Would wait for ${serviceName} at ${url} (maxRetries=${maxRetries}, interval=${retryInterval}ms)`,
      colors.cyan,
    );

    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let retries = 0;

    const checkService = () => {
      try {
        let cmd;

        if (isWindows) {
          cmd = `powershell -Command "try { $r = Invoke-WebRequest -Uri '${url}' -UseBasicParsing -TimeoutSec 5; $r.StatusCode } catch { 0 }"`;
        } else {
          cmd = `sh -c "curl -s -o /dev/null -w '%{http_code}' --max-time 5 '${url}' || echo 0"`;
        }

        const result = execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
        const code = parseInt(String(result).trim(), 10);

        if (code >= 200 && code < 400) {
          log(`✅ ${serviceName} is ready at ${url}`, colors.green);
          resolve();

          return;
        }
      } catch {
        // ignore
      }

      retries++;

      if (retries >= maxRetries) {
        reject(new Error(`${serviceName} not ready after ${maxRetries} attempts`));

        return;
      }

      setTimeout(checkService, retryInterval);
    };

    checkService();
  });
}

function openBrowser(url) {
  if (dryRun) {
    log(`[dry-run] Would open browser at: ${url}`, colors.cyan);

    return;
  }

  let cmd;

  if (isWindows) {
    cmd = `start "" "${url}"`;
  } else if (isMac) {
    cmd = `open "${url}"`;
  } else if (isLinux) {
    cmd = `xdg-open "${url}"`;
  } else {
    return;
  }

  execAsync(cmd, (err) => {
    if (!err) {
      log('🚀 Frontend opened in browser!', colors.green);
    }
  });
}

async function main() {
  const startTime = Date.now();

  log('🚀 TaskForge Rebuild Started', colors.bright);

  if (dryRun) {
    log('🧪 DRY-RUN MODE: no files, images, containers or deps will be changed.', colors.yellow);
  }

  if (parallelBuild) {
    log('🧵 Parallel build enabled (docker compose build --parallel)', colors.yellow);
  }

  if (doPrune) {
    log('🧹 Global prunes enabled by --prune (dangling images & build cache).', colors.yellow);
  } else {
    log('🛡️ Global prunes disabled (safe mode). Use --prune to enable.', colors.yellow);
  }

  // 1) Stop and remove containers
  if (!skipCleanup) {
    await step('1) Stop and remove containers', () => {
      const cmd =
        'docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans';
      exec(cmd);
    });
  } else {
    log('⚡ Skipping container cleanup', colors.yellow);
  }

  // 2) Clean node_modules (respect ONLY vs. FULL)
  if (!skipCleanup) {
    await step('2) Clean node_modules', () => {
      if (onlyFrontend) {
        removeIfExists('apps/vue/node_modules');
      } else if (onlyBackend) {
        removeIfExists('apps/backend/node_modules');
      } else {
        removeIfExists('apps/backend/node_modules');
        removeIfExists('apps/vue/node_modules');
        removeIfExists('node_modules'); // root - only in full mode
      }
    });
  }

  // 3) Remove package-locks (respect ONLY vs. FULL)
  if (!skipCleanup) {
    await step('3) Remove package-locks', () => {
      if (onlyFrontend) {
        removeIfExists('apps/vue/package-lock.json');
      } else if (onlyBackend) {
        removeIfExists('apps/backend/package-lock.json');
      } else {
        removeIfExists('apps/backend/package-lock.json');
        removeIfExists('apps/vue/package-lock.json');
        removeIfExists('package-lock.json'); // root - only in full mode
      }
    });
  }

  // 4) Remove Docker images (SCOPED! no global prune unless --prune AND full)
  if (!skipCleanup) {
    await step('4) Remove Docker images', () => {
      const images = [];

      if (!onlyFrontend) {
        images.push('taskforge-api');
      }

      if (!onlyBackend) {
        images.push('taskforge-frontend');
      }

      if (images.length) {
        try {
          const cmd = `docker image rm ${images.join(' ')}`;
          exec(cmd, { stdio: 'pipe' });
        } catch {
          // ignore
        }
      } else {
        log('No project images selected for removal in this mode', colors.yellow);
      }

      // Global prune runs only in FULL mode and only when --prune is passed
      if (!onlyFrontend && !onlyBackend && doPrune) {
        const pruneImagesCmd = 'docker image prune -f';
        exec(pruneImagesCmd, { stdio: 'pipe' });

        const pruneBuilderCmd = 'docker builder prune -f';
        exec(pruneBuilderCmd, { stdio: 'pipe' });
      } else {
        log('Skipping global prune (either ONLY mode or --prune not set)', colors.yellow);
      }
    });
  }

  // 5) Install dependencies (scoped)
  if (!skipDeps) {
    await step('5) Install dependencies', () => {
      // Always install root dependencies first
      const npmInstallRoot = 'npm install';
      exec(npmInstallRoot);

      if (onlyBackend) {
        const cmd = 'npm install --workspace apps/backend';
        exec(cmd);
      } else if (onlyFrontend) {
        const cmd = 'npm install --workspace apps/vue';
        exec(cmd);
      } else {
        const cmdBe = 'npm install --workspace apps/backend';
        const cmdFe = 'npm install --workspace apps/vue';
        exec(cmdBe);
        exec(cmdFe);
      }
    });
  } else {
    log('⚡ Skipping dependency installation', colors.yellow);
  }

  // 6) Build Docker images (supports --parallel-build)
  if (!skipBuild) {
    await step('6) Build Docker images', () => {
      const composeFiles = '-f docker-compose.yml -f docker-compose.dev.yml';
      const parallel = parallelBuild ? '--parallel ' : '';

      if (onlyBackend) {
        const cmd = `docker compose ${composeFiles} build ${parallel} --no-cache api`;
        exec(cmd);
      } else if (onlyFrontend) {
        const cmd = `docker compose ${composeFiles} build ${parallel} --no-cache frontend`;
        exec(cmd);
      } else {
        const cmd = `docker compose ${composeFiles} build ${parallel} --no-cache api frontend`;
        exec(cmd);
      }
    });
  } else {
    log('⚡ Skipping Docker image build', colors.yellow);
  }

  // 7) Start services
  if (onlyBackend) {
    log(
      '\nℹ️ Skipping service startup in backend-only mode. Start containers manually if needed (e.g. docker compose up api redis).',
      colors.yellow,
    );
  } else {
    await step('7) Start services', () => {
      const composeFiles = '-f docker-compose.yml -f docker-compose.dev.yml';

      if (onlyFrontend) {
        const cmd = `docker compose ${composeFiles} up -d frontend`;
        exec(cmd);
      } else {
        const cmd = `docker compose ${composeFiles} up -d redis api frontend`;
        exec(cmd);
      }
    });
  }

  // 8) Backend-only steps (wait for supporting services)
  if (!onlyFrontend) {
    if (onlyBackend) {
      log(
        '\nℹ️ Skipping container readiness checks in backend-only mode because services were not started automatically.',
        colors.yellow,
      );
    } else {
      await step('8) Wait for Redis/API', async () => {
        log('Waiting for Redis to be ready...');

        let redisRetries = 30;

        while (redisRetries > 0) {
          try {
            const cmd =
              'docker compose -f docker-compose.yml -f docker-compose.dev.yml exec redis redis-cli ping';
            exec(cmd, { stdio: 'pipe' });
            log('Redis is ready!');
            break;
          } catch {
            redisRetries--;

            if (redisRetries === 0) {
              throw new Error('Redis failed to become ready');
            }

            log(`Waiting for Redis... (${redisRetries} attempts left)`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        log('Waiting for API container to be ready...');

        let apiRetries = 60;

        while (apiRetries > 0) {
          try {
            const cmd =
              'docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api echo "Container is ready"';
            exec(cmd, { stdio: 'pipe' });

            log('API container is ready!');
            break;
          } catch {
            apiRetries--;

            if (apiRetries === 0) {
              throw new Error('API failed to become ready');
            }

            log(`Retrying in 3 seconds... (${apiRetries} attempts left)`);
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        }
      });
    }
  }

  const buildTime = Date.now() - startTime;
  log(
    `\n🎉 Build ${dryRun ? '(dry-run) ' : ''}completed in ${formatTime(buildTime)}!`,
    colors.green,
  );

  // 9–10) Final startup & URLs only in FULL mode
  if (!onlyFrontend && !onlyBackend) {
    const serviceStartTime = Date.now();

    await step('9) Start services in dev mode', () => {
      const cmd = 'docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d';
      exec(cmd);
    });

    await step('10) Wait and show URLs', async () => {
      await waitForService('http://localhost:2999/api/health', 'API');
      await waitForService('http://localhost:3001', 'Frontend');

      const serviceTime = Date.now() - serviceStartTime;
      log(
        `\n🚀 All services ${dryRun ? '(dry-run) ' : ''}started in ${formatTime(serviceTime)}!`,
        colors.green,
      );
      log('🌐 API: http://localhost:2999/api');
      log('🌐 API Health: http://localhost:2999/api/health');
      log('🌐 Frontend: http://localhost:3001');

      if (!dryRun) {
        openBrowser('http://localhost:3001');
      } else {
        log('[dry-run] Would open browser at http://localhost:3001', colors.cyan);
      }
    });
  } else if (onlyFrontend) {
    log(
      `\n✅ Frontend build & container ${dryRun ? '(dry-run) ' : ''}ready in ${formatTime(buildTime)}!`,
      colors.green,
    );
  } else if (onlyBackend) {
    log(
      `\n✅ Backend rebuild ${dryRun ? '(dry-run) ' : ''}completed in ${formatTime(buildTime)}.`,
      colors.green,
    );
    log(
      'ℹ️ Containers were not started automatically. Use docker compose or npm scripts to launch services when ready.',
      colors.yellow,
    );
  }

  const mode = onlyFrontend ? 'frontend-only' : onlyBackend ? 'backend-only' : 'full';
  log(
    `\n📦 Summary: mode=${mode}, cleanup=${!skipCleanup}, deps=${!skipDeps}, build=${!skipBuild}, parallel-build=${parallelBuild}, prune=${doPrune}, dry-run=${dryRun}`,
    colors.bright,
  );
}

main().catch((e) => {
  log(`❌ Script failed: ${e.message}`, colors.red);
  process.exit(1);
});
