# Contributing to TaskForge

Thanks for your interest in contributing! This doc explains the workflow and
conventions used in this repo.

## Prerequisites

- Node.js 20 LTS
- npm 10+
- Docker Desktop (Compose v2)

## Setup

```bash
npm install
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d redis # optional
npm run backend:dev
```

In a second terminal:

```bash
npm run dev -w apps/vue
```

- API: http://localhost:2999 (health: `/api/health`, docs: `/api/docs`)
- Frontend: http://localhost:3001
- Stop Docker services when you are done: `npm run backend:stop`

## Code Style & Linting

- Run checks before committing:
  - `npm run lint` — shared ESLint/Prettier check
  - `npm run lint:fix` — apply ESLint/Prettier fixes
- Pre‑commit hooks (Husky + lint‑staged) enforce formatting/linting on staged
  files.

## Commits & Branches

- Conventional Commits (enforced by commitlint):
  - `feat(tasks): add bulk update`
  - `fix(api): correct pagination bounds`
  - `chore(docs): update readme`
- Branch naming:
  - `feature/<short-topic>`
  - `fix/<short-topic>`
  - `chore/<short-topic>`
  - `docs/<short-topic>`

## Testing

- Backend tests (Jest):
  - `npm run test:e2e -w apps/backend`
  - (Unit test script to be added once specs land)
- Frontend tests (Vitest):
  - `cd apps/vue && npx vitest --run`

## Swagger / API Docs

- Keep DTOs and controllers annotated with `@nestjs/swagger` decorators.
- Swagger UI is available at `/api/docs` in dev or when `SWAGGER_ENABLE=true`.

## Data Storage

- The backend uses an in-memory task store; no database migrations or client
  generation are required.

## Pull Requests

- Ensure the checklist is satisfied:
  - [ ] Code builds: `npm run build`
  - [ ] Tests pass: backend + frontend
  - [ ] Lint/format pass: `npm run check`
  - [ ] Swagger annotations updated (if API changed)
  - [ ] README/docs updated when behavior changes

## Release Notes

- Use Conventional Commits to generate change logs automatically (future CI
  task).

Thanks again for contributing!
