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

function step(title, action) {
  log(`\n=== ${title} ===`, colors.yellow);
  try {
    action();
    log(`✅ ${title} completed`, colors.green);
  } catch (error) {
    log(`❌ ${title} failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

function exec(command, options = {}) {
  log(`Running: ${command}`, colors.cyan);
  return execSync(command, { stdio: 'inherit', ...options });
}

function removeIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
      log(`Removed directory: ${filePath}`);
    } else {
      fs.unlinkSync(filePath);
      log(`Removed file: ${filePath}`);
    }
  }
}

const startTime = Date.now();

log('🚀 TaskForge Full Rebuild Started', colors.bright);
log(`📁 Project directory: ${process.cwd()}`, colors.cyan);

step('1) Stop and remove containers', () => {
  exec('docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans');
});

step('2) Clean node_modules directories', () => {
  const nodeModulesPaths = [
    'node_modules',
    'backend/node_modules',
    'frontend/node_modules'
  ];
  
  nodeModulesPaths.forEach(removeIfExists);
});

step('3) Remove package-lock files', () => {
  const lockFiles = [
    'package-lock.json',
    'backend/package-lock.json',
    'frontend/package-lock.json'
  ];
  
  lockFiles.forEach(removeIfExists);
});

step('4) Remove Docker images and build cache', () => {
  try {
    // Try to remove images, ignore if they don't exist
    try {
      exec('docker image rm taskforge-api taskforge-frontend', { stdio: 'pipe' });
    } catch {
      log('Some images not found, continuing...', colors.yellow);
    }
    exec('docker builder prune -f', { stdio: 'pipe' });
  } catch (error) {
    log('Some cleanup commands failed, but continuing...', colors.yellow);
  }
});

step('5) Build Docker images (no cache)', () => {
  exec('docker compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache');
});

step('6) Start services', () => {
  exec('docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d');
});

step('7) Install host dependencies', () => {
  exec('npm install');
  exec('npm install --prefix backend');
  exec('npm install --prefix frontend');
});

step('8) Wait for services to be ready', () => {
  log('Waiting for API to be ready...');
  let retries = 30;
  while (retries > 0) {
    try {
      exec('docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api npx prisma generate', { stdio: 'pipe' });
      break;
    } catch (error) {
      retries--;
      if (retries === 0) throw error;
      log(`Retrying in 2 seconds... (${retries} attempts left)`);
      // Cross-platform sleep
      const start = Date.now();
      while (Date.now() - start < 2000) {
        // Wait 2 seconds
      }
    }
  }
});

step('9) Run Prisma migrations', () => {
  exec('docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api npx prisma migrate deploy');
});

const elapsed = Math.round((Date.now() - startTime) / 1000);
log(`\n🎉 TaskForge rebuild completed in ${elapsed}s!`, colors.green);
log('\n📋 Next steps:', colors.bright);
log('  • Check logs: npm run logs');
log('  • API health: curl http://localhost:2999/health');
log('  • Frontend: http://localhost:3001');
