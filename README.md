# TaskForge

[![Node.js](https://img.shields.io/badge/Node-20_LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-v2-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3-F7B93E?logo=prettier&logoColor=black)](https://prettier.io/)
[![License](https://img.shields.io/badge/License-Proprietary-orange.svg)](LICENSE)

Modern full-stack task management app with a decoupled Nuxt 4 frontend and
NestJS + Prisma backend. Backend services run via Docker; frontend runs locally
in dev.

## Overview

- Backend: NestJS 11 (REST) + Prisma + PostgreSQL + Redis
- Frontend: Nuxt 4 + PrimeVue 4 (dev server proxies to API)
- Infra: Docker Compose for DB/Redis/API, Node 20 LTS
- Quality: ESLint flat config, Prettier, Husky + lint-staged
- Docs: Swagger UI at `/api/docs` (enabled in dev)

## Tech Stack

- Backend: NestJS, Prisma, PostgreSQL, Redis, RxJS
- Frontend: Nuxt 4, Vue 3.5, PrimeVue 4, Pinia, TypeScript
- DevOps: Docker Compose, Husky, Commitlint, Renovate, EditorConfig

## Project Structure

```
taskforge/
+- backend/                  # NestJS API server
|  +- src/
|  |  +- health/             # Health check
|  |  +- tasks/              # Tasks CRUD
|  |  +- prisma/             # Prisma service module
|  |  L- redis/              # Redis module
|  L- prisma/
|     +- schema.prisma       # DB schema
|     L- seed.ts             # Demo seed data
+- frontend/                 # Nuxt 4 SPA (runs locally)
|  L- app/
|     +- components/
|     +- composables/
|     +- stores/
|     L- utils/
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
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend `.env` (key vars):

- `DATABASE_URL=postgresql://taskforge:taskforge@db:5432/taskforge`
- `REDIS_URL=redis://redis:6379`
- `PORT=2999`
- `ALLOWED_ORIGINS=http://127.0.0.1:3001`
- `SWAGGER_ENABLE=true`

Frontend `.env` (key vars):

- `NUXT_PUBLIC_API_BASE=/api` (proxied by Nuxt in dev)
- `NUXT_PORT=3001`

## Development

### Quick Start (from scratch)

```bash
# 1) Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2) Install all dependencies (root + apps)
npm run deps:reinstall

# 3) Compile backend (Docker image build)
npm run backend:build

# 4) Start backend services (API + DB + Redis)
npm run backend:up
# API: http://127.0.0.1:2999 | Swagger: http://127.0.0.1:2999/api/docs

# 5) Verify health
curl http://127.0.0.1:2999/api/health

# 6) Start frontend (in another terminal)
npm run frontend:dev

# 7) Open in Chrome
# URL: http://127.0.0.1:3001

# 8) Enjoy 🎉
```

Windows PowerShell (alternative for step 1):

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

## API Docs (Swagger)

- Dev: http://127.0.0.1:2999/api/docs

## Commands Cheatsheet

Key scripts; full list is in `package.json`.

```bash
# Backend
npm run backend:build      # Build API Docker image
npm run backend:up         # Start API + DB + Redis
npm run backend:down       # Stop and remove volumes

# Frontend
npm run frontend:dev       # Start Nuxt dev server (http://127.0.0.1:3001)

# Format & Lint
npm run check              # Prettier check + ESLint
npm run fix                # Prettier write + ESLint --fix
```

- Swagger in dev: http://127.0.0.1:2999/api/docs
- Set `SWAGGER_ENABLE=true` to expose docs in production

## API Tips

- Basic health check: `GET http://127.0.0.1:2999/api/health`
- Full API reference is available via Swagger at `/api/docs` in dev

## Notes

- CORS: controlled via `ALLOWED_ORIGINS` (CSV). Dev mode allows any origin by
  default.
- Frontend dev proxy: Nuxt proxies `/api/**` to `http://127.0.0.1:2999`.
- Node version: enforced to 20.x via `engines`.

## Testing

- Backend: Jest (unit, e2e) under `backend/`
- Frontend: Vitest (`frontend/tests`)

## Troubleshooting

- Ports in use (2999/3001/5432/6379): free them or adjust envs.
- Prisma Client platform mismatch: install deps inside container and run
  `prisma generate` (handled by dev compose).
- API unreachable from Nuxt: ensure `backend:up` is running, then restart
  `frontend:dev`.

## License

Copyright (c) 2025 Dmitry Demura. All rights reserved.

This project is proprietary software. No permission is granted to copy, modify,
merge, publish, distribute, sublicense, or sell copies of this software without
explicit written authorization from the copyright holder.
