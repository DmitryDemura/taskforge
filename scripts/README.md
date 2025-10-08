# Scripts

Utility scripts used across the repo. Prefer npm scripts in the root
`package.json` as entrypoints.

## Available

- `reinstall-deps.js` � Reinstall dependencies in root, backend, frontend
  (`npm run deps:reinstall`). Cleans node_modules and package-lock.json before
  install.
- `backend-rebuild.js` � Backend rebuild helper. Use via:
  - `npm run backend:rebuild:full` (with deps; cleans before install)
  - `npm run backend:rebuild:fast` (without deps)
  - `npm run backend:stop` (stop backend containers if you started them
    manually)
  - Note: backend rebuild no longer auto-starts containers; launch services
    yourself when needed.
  - Frontend/full modes are deprecated; script enforces backend-only.
- `lint-format.mjs` � Unified `check`/`fix` runner for Prettier + ESLint.
- `clean.js` � Cleanup Docker resources and node_modules (destructive).

## Notes

- Prefer npm scripts over calling these files directly.
- Frontend runs locally with Nuxt; avoid Dockerizing the frontend in dev.

## backend-rebuild flags

Most users should use the npm aliases above. Flags:

- `--backend-only` � required; run in backend-only mode (enforced by script)
- `--skip-cleanup` � do not remove node_modules/lock files or stop containers
- `--skip-deps` � skip reinstalling backend dependencies
- `--skip-build` � skip TypeScript/Docker build steps
- `--parallel-build` � pass parallel flag to Docker builder where applicable
- `--prune` � run Docker image/builder prune (destructive; frees disk space)
- `--dry-run` � print actions without executing

Examples:

```bash
# Full rebuild with dependency reinstall (same as npm run backend:rebuild:full)
node scripts/backend-rebuild.js --backend-only

# Fast rebuild without deps (same as npm run backend:rebuild:fast)
node scripts/backend-rebuild.js --backend-only --skip-deps

# Rebuild and free Docker cache
node scripts/backend-rebuild.js --backend-only --prune

# Preview what would run
node scripts/backend-rebuild.js --backend-only --dry-run
```
