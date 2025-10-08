# Scripts

Utility helpers that back the npm scripts defined in the root `package.json`.
Invoke the npm aliases whenever possible so tooling stays consistent, and fall
back to these files only when you need custom behavior.

## Available Tools

- `check-reserved.js` – Fails commits that try to add Windows reserved device
  names (runs through Husky).
- `clean.js` – Removes build artifacts, Docker resources, and `node_modules`.
  Exposed via `npm run clean` / `npm run clean:git`.
- `lint-format.mjs` – Shared ESLint + Prettier runner behind `npm run lint` /
  `npm run lint:fix`.
- `rebuild.js` – Multi-mode rebuild orchestrator. Called through:
  - `npm run rebuild` (full workspace)
  - `npm run backend:rebuild`
  - `npm run frontend:rebuild` Backend mode intentionally **does not**
    auto-start Docker containers; use `docker compose … up -d redis` (and
    optionally api/frontend) when you actually need them, then
    `npm run backend:stop` to shut them down.
- `reinstall-deps.js` – Reinstalls dependencies across workspaces. Run directly
  (`node scripts/reinstall-deps.js`) if you need a clean reinstall outside the
  normal `npm install`.

## Rebuild Script Flags

`rebuild.js` accepts several flags when you call it directly:

- `--backend-only` – limit operations to the backend workspace
- `--frontend-only` – limit operations to the frontend workspace
- `--skip-cleanup` – keep existing `node_modules` and Docker artifacts
- `--skip-deps` – skip reinstalling dependencies
- `--skip-build` – bypass TypeScript/Docker builds
- `--parallel-build` – enable Docker’s parallel build flag
- `--prune` – prune Docker caches (destructive)
- `--dry-run` – log actions without executing

Example invocations:

```bash
# Same as npm run backend:rebuild
node scripts/rebuild.js --backend-only

# Frontend rebuild only (equivalent to npm run frontend:rebuild)
node scripts/rebuild.js --frontend-only

# Preview cleanup steps without running anything
node scripts/rebuild.js --backend-only --dry-run
```
