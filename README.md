# TaskForge

[![Node.js](https://img.shields.io/badge/Node-20_LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-v2-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3-F7B93E?logo=prettier&logoColor=black)](https://prettier.io/)
[![License](https://img.shields.io/badge/License-Proprietary-orange.svg)](LICENSE)

Modern full-stack task management app with a decoupled Nuxt 3 frontend and
NestJS backend that caches via Redis (with a safe in-memory fallback) and stores
tasks in-memory for quick iteration. Backend services can run against Docker
Redis or operate fully locally; the frontend runs locally in dev.

## Overview

- Backend: NestJS 11 (REST) + Redis-backed caching + in-memory task store
- Frontend: Nuxt 3 + PrimeVue 3 (dev server proxies to API)
- Infra: Docker Compose for Redis/API, Node 20 LTS
- Quality: ESLint flat config, Prettier, Husky + lint-staged
- Docs: Swagger UI at `/api/docs` (enabled in dev)

## Tech Stack

- Backend: NestJS, Redis (graceful fallback to in-memory cache), RxJS
- Frontend: Nuxt 3, Vue 3.3, PrimeVue 3, Pinia, TypeScript
- DevOps: Docker Compose, Husky, Commitlint, Renovate, EditorConfig

## Project Structure

```
taskforge/
+- apps/
|  +- backend/               # NestJS API server
|  |  +- src/
|  |  |  +- health/          # Service health checks
|  |  |  +- tasks/           # Tasks CRUD + caching
|  |  |  L- redis/           # Redis module + fallback client
|  |  L- test/               # e2e specs
|  L- vue/                   # Nuxt 3 SPA (runs locally)
|     L- app/                # Nuxt app directory
+- packages/                 # Shared configs/libraries
+- docker-compose.yml        # Base services
+- docker-compose.dev.yml    # Dev overrides
L- scripts/                  # Dev/rebuild/utility scripts
```

## Requirements

- Node.js 20 LTS
- npm 10+
- Docker Desktop (Compose v2)

## Environment

Copy example envs:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/vue/.env.example apps/vue/.env
```

Backend `.env` (key vars):

- `REDIS_URL=redis://redis:6379`
- `PORT=2999`

Frontend `.env` (key vars):

- `NUXT_PUBLIC_API_BASE=/api` (proxied by Nuxt in dev)
- `NUXT_PORT=3001`

## Development

### Quick Start (from scratch)

1. Copy environment files:

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/vue/.env.example apps/vue/.env
   ```

   PowerShell:

   ```powershell
   Copy-Item apps/backend/.env.example apps/backend/.env
   Copy-Item apps/vue/.env.example apps/vue/.env
   ```

2. Install workspace dependencies (Node 20 required):

   ```bash
   npm install
   ```

3. (Optional but recommended) Start Redis via Docker:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d redis
   ```

   If Redis is not available, the backend automatically falls back to an
   in-memory cache—handy for quick local experiments.

4. Start the backend in watch mode:

   ```bash
   npm run backend:dev
   ```

   - API base: http://127.0.0.1:2999
   - Swagger: http://127.0.0.1:2999/api/docs

5. Start the Nuxt dev server in another terminal:

   ```bash
   npm run frontend:dev
   ```

   - Frontend: http://127.0.0.1:3001

6. When you finish with Docker services, stop Redis (and any other backend
   containers you started):

   ```bash
   npm run backend:stop
   ```

## API Docs (Swagger)

- Dev: http://127.0.0.1:2999/api/docs

## Commands Cheatsheet

Core npm scripts (see `package.json` for the complete list):

- `npm run backend:dev` — start the Nest backend with watch mode
- `npm run backend:rebuild` — clean & rebuild backend artifacts (no auto-start)
- `npm run backend:stop` — stop Docker containers you started manually
- `npm run frontend:dev` — run the Nuxt frontend dev server
- `npm run lint` / `npm run lint:fix` — shared lint/format checks
- `npm run rebuild` — orchestrated rebuild across workspaces

## API Tips

- Basic health check: `GET http://127.0.0.1:2999/api/health`
- Full API reference is available via Swagger at `/api/docs` in dev

## Notes

- CORS: controlled via `ALLOWED_ORIGINS` (CSV). Dev mode allows any origin by
  default.
- Frontend dev proxy: Nuxt proxies `/api/**` to `http://127.0.0.1:2999`.
- Node version: enforced to 20.x via `engines`.

## Testing

- Backend: Jest (unit + e2e) under `apps/backend`
- Frontend: Vitest (`apps/vue/tests`)

## Troubleshooting

- Ports in use (2999/3001/6379): free them or adjust envs. Docker maps Redis to
  localhost:6379 by default.
- API unreachable from Nuxt: ensure `npm run backend:dev` is active (or your
  Docker container is up), then restart the Nuxt dev server.
- Redis not running: either start the Docker service (see Quick Start) or rely
  on the built-in in-memory cache—logs will show which mode is active.

## License

Copyright (c) 2025 Dmitry Demura. All rights reserved.

This project is proprietary software. No permission is granted to copy, modify,
merge, publish, distribute, sublicense, or sell copies of this software without
explicit written authorization from the copyright holder.
