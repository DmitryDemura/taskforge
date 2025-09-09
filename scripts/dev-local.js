#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  log(`Running: ${command}`, colors.cyan);

  try {
    return execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      ...options,
    });
  } catch (error) {
    log(`Error executing: ${command}`, colors.red);
    throw error;
  }
}

function step(title, fn) {
  log(`\n=== ${title} ===`, colors.yellow);
  fn();
  log(`✅ ${title} completed`, colors.green);
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

  if (majorVersion < 18) {
    log(
      `❌ Node.js version ${nodeVersion} is not supported. Please use Node.js 18 or higher.`,
      colors.red,
    );
    process.exit(1);
  }

  log(`✅ Node.js version ${nodeVersion} is supported`, colors.green);
}

function checkDependencies() {
  const requiredCommands = ['npm', 'docker', 'docker-compose'];

  for (const cmd of requiredCommands) {
    try {
      execSync(`${cmd} --version`, { stdio: 'pipe' });
      log(`✅ ${cmd} is available`, colors.green);
    } catch (_error) {
      log(`❌ ${cmd} is not available. Please install it.`, colors.red);
      process.exit(1);
    }
  }
}

async function main() {
  const startTime = Date.now();

  log('🚀 TaskForge Local Development Setup', colors.bright);
  log('This script sets up local development environment quickly', colors.cyan);

  step('1) Check system requirements', () => {
    checkNodeVersion();
    checkDependencies();
  });

  step('2) Install dependencies', () => {
    // Install root dependencies
    if (!fs.existsSync('node_modules')) {
      exec('npm install');
    } else {
      log('Root dependencies already installed', colors.yellow);
    }

    // Install backend dependencies
    if (!fs.existsSync('backend/node_modules')) {
      exec('npm install --prefix backend');
    } else {
      log('Backend dependencies already installed', colors.yellow);
    }

    // Install frontend dependencies
    if (!fs.existsSync('frontend/node_modules')) {
      exec('npm install --prefix frontend');
    } else {
      log('Frontend dependencies already installed', colors.yellow);
    }
  });

  step('3) Start database and Redis (Docker)', () => {
    // Only start DB and Redis, not the full application
    exec('docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db redis');
  });

  step('4) Wait for database to be ready', () => {
    log('Waiting for database to be ready...', colors.yellow);
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      try {
        execSync(
          'docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T db pg_isready -U postgres',
          { stdio: 'pipe' },
        );
        log('Database is ready!', colors.green);
        break;
      } catch (_error) {
        attempts++;

        if (attempts >= maxAttempts) {
          log('Database failed to start within timeout', colors.red);
          process.exit(1);
        }

        log(`Waiting for database... (${attempts}/${maxAttempts})`, colors.yellow);
        execSync('timeout 2 2>nul || ping 127.0.0.1 -n 3 >nul', { stdio: 'pipe' }); // Windows-compatible sleep
      }
    }
  });

  step('5) Run database migrations', () => {
    process.chdir('backend');

    // Copy .env.local to .env for local development
    if (fs.existsSync('.env.local')) {
      fs.copyFileSync('.env.local', '.env');
      log('Using .env.local for local development', colors.yellow);
    }

    exec('npx prisma generate');
    exec('npx prisma db push');

    process.chdir('..');
  });

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  log(`\n🎉 Local development environment ready in ${elapsed}s!`, colors.green);
  log('\n📋 Services status:', colors.bright);
  log('  • Database: ✅ Ready (Docker)');
  log('  • Redis: ✅ Ready (Docker)');
  log('  • API: ⏳ Ready to start locally');
  log('  • Frontend: ⏳ Ready to start locally');

  log('\n📋 Next steps:', colors.bright);
  log('  • Start API: npm run dev:api');
  log('  • Start Frontend: npm run dev:frontend');
  log('  • Test API health: curl http://localhost:2999/api/health');
  log('  • Frontend will be available at: http://localhost:3001');

  log('\n💡 Pro tips:', colors.cyan);
  log('  • Use "npm run dev" to start both API and Frontend');
  log('  • Use "npm run logs:db" to check database logs');
  log('  • Use "npm run logs:redis" to check Redis logs');
}

main().catch((error) => {
  log(`\n❌ Setup failed: ${error.message}`, colors.red);
  process.exit(1);
});
