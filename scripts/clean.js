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

function removeIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
      log(`✅ Removed directory: ${filePath}`, colors.green);
    } else {
      fs.unlinkSync(filePath);
      log(`✅ Removed file: ${filePath}`, colors.green);
    }
  } else {
    log(`⏭️  Not found: ${filePath}`, colors.yellow);
  }
}

log('🧹 TaskForge Cleanup Started', colors.bright);

log('\n📦 Cleaning node_modules...', colors.cyan);

const nodeModulesPaths = [
  'node_modules',
  'backend/node_modules',
  'frontend/node_modules'
];

nodeModulesPaths.forEach(removeIfExists);

log('\n🔒 Cleaning package-lock files...', colors.cyan);

const lockFiles = [
  'package-lock.json',
  'backend/package-lock.json',
  'frontend/package-lock.json'
];

lockFiles.forEach(removeIfExists);

log('\n🐳 Cleaning Docker resources...', colors.cyan);

try {
  execSync('docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans', { stdio: 'inherit' });
  log('✅ Docker containers and volumes removed', colors.green);
} catch (error) {
  log('⚠️  Docker cleanup failed (containers might not be running)', colors.yellow);
}

try {
  execSync('docker image rm taskforge-api taskforge-frontend', { stdio: 'pipe' });
  log('✅ TaskForge Docker images removed', colors.green);
} catch (error) {
  log('⚠️  Some Docker images might not exist', colors.yellow);
}

try {
  execSync('docker builder prune -f', { stdio: 'pipe' });
  log('✅ Docker build cache cleared', colors.green);
} catch (error) {
  log('⚠️  Docker build cache cleanup failed', colors.yellow);
}

log('\n🎉 Cleanup completed!', colors.green);
log('\n📋 Next steps:', colors.bright);
log('  • Full rebuild: npm run rebuild');
log('  • Or manual: npm install && docker compose up --build');
