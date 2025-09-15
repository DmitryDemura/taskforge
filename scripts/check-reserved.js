#!/usr/bin/env node
/*
  Blocks committing files or folders with Windows reserved device names:
  CON, PRN, AUX, NUL, COM1..COM9, LPT1..LPT9 (case-insensitive),
  even when used with an extension (e.g., con.txt) or as a directory name.
*/

const { execSync } = require('child_process');

const RESERVED = new Set([
  'con',
  'prn',
  'aux',
  'nul',
  'com1',
  'com2',
  'com3',
  'com4',
  'com5',
  'com6',
  'com7',
  'com8',
  'com9',
  'lpt1',
  'lpt2',
  'lpt3',
  'lpt4',
  'lpt5',
  'lpt6',
  'lpt7',
  'lpt8',
  'lpt9',
]);

function getStagedFiles() {
  try {
    const out = execSync('git diff --cached --name-only', { encoding: 'utf8' });

    return out.split(/\r?\n/).filter(Boolean);
  } catch (_e) {
    return [];
  }
}

function violatesReserved(path) {
  // Git uses forward slashes; split on '/'
  const segments = path.split('/');
  for (const seg of segments) {
    if (!seg) {
      continue;
    }

    const base = seg.split('.')[0].toLowerCase();

    if (RESERVED.has(base)) {
      return true;
    }
  }

  return false;
}

function main() {
  const files = getStagedFiles();

  if (files.length === 0) {
    process.exit(0);
  }

  const bad = files.filter(violatesReserved);

  if (bad.length > 0) {
    console.error('\nError: attempting to commit paths with Windows reserved names:\n');
    for (const f of bad) {
      console.error(`  - ${f}`);
    }
    console.error('\nRename these paths (avoid CON, PRN, AUX, NUL, COM1..9, LPT1..9).');
    process.exit(1);
  }
}

main();
