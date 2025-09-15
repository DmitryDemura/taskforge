# Contributing to TaskForge

Thanks for your interest in contributing! This doc explains the workflow and
conventions used in this repo.

## Prerequisites

- Node.js 20 LTS
- npm 10+
- Docker Desktop (Compose v2)

## Setup

```bash
npm run deps:reinstall
npm run backend:up
npm run frontend:dev
```

- API: http://localhost:2999 (health: `/api/health`, docs: `/api/docs`)
- Frontend: http://localhost:3001

## Code Style & Linting

- Run checks before committing:
  - `npm run check` — Prettier (check) + ESLint (no fix)
  - `npm run fix` — Prettier (write) + ESLint (fix)
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

- Backend tests:
  - `npm run backend:test`
  - `npm run backend:test:e2e`
- Frontend tests:
  - `npm run frontend:test`

## Swagger / API Docs

- Keep DTOs and controllers annotated with `@nestjs/swagger` decorators.
- Swagger UI is available at `/api/docs` in dev or when `SWAGGER_ENABLE=true`.

## Prisma / Database

- Apply migrations & generate client:
  - `npm run prisma:migrate`
  - `npm run prisma:generate`
- Seed demo data:
  - `npm run prisma:seed`

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

Thanks again for contributing! 🙌
