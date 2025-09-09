# TaskForge Development Cheatsheet

Quick reference for common development tasks and commands.

## 🚀 Quick Start Commands

### Essential Setup

```bash
# Clone and setup
git clone https://github.com/DmitryDemura/taskforge.git
cd taskforge
npm install

# Start development environment (recommended)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
cd frontend && npm run dev
```

### Nuclear Option (Full Rebuild)

```bash
npm run rebuild  # Cleans everything and rebuilds from scratch
```

## 🐳 Docker Commands

### Service Management

```bash
# Start all services
npm run start
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Stop all services
npm run stop
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# Restart specific service
docker compose -f docker-compose.yml -f docker-compose.dev.yml restart api

# View service status
docker compose -f docker-compose.yml -f docker-compose.dev.yml ps
```

### Logs & Debugging

```bash
# View all logs
npm run logs

# View specific service logs
npm run logs:api
npm run logs:frontend
npm run logs:db
npm run logs:redis

# Follow logs in real-time
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f api
```

### Container Management

```bash
# Execute commands in containers
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api npm run lint
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api bash

# Rebuild specific service
docker compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache api
```

## 🗄️ Database Commands

### Prisma Operations

```bash
# Generate Prisma client
npm run prisma:generate
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api npx prisma generate

# Run migrations
npm run prisma:migrate
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api npx prisma migrate deploy

# Open database admin
npm run prisma:studio
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api npx prisma studio
# Opens at http://localhost:5555
```

### Database Management

```bash
# Check database connection
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec db pg_isready -U taskforge -d taskforge

# Connect to database
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec db psql -U taskforge -d taskforge

# Reset database (careful!)
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
```

## 🔧 Code Quality Commands

### Unified Linting & Formatting (ESLint 9)

```bash
# Unified commands (recommended)
npm run lint            # Lint all code with unified configuration
npm run lint:fix        # Fix linting issues automatically
npm run format          # Check formatting with Prettier
npm run format:fix      # Fix formatting automatically

# Individual project commands (if needed)
npm run lint:backend    # Lint backend only
npm run lint:frontend   # Lint frontend only
npm run format:backend  # Format backend only
npm run format:frontend # Format frontend only
```

**Features:**

- ✅ Single ESLint 9 flat config for all projects
- ✅ Integrated Prettier formatting
- ✅ CLI utilities for batch operations
- ✅ Consistent brace-style enforcement

## 🌐 API Testing Commands

### Health Checks

```bash
# API health check
curl http://localhost:2999/api/health

# Expected response:
# {"status":"ok","timestamp":"...","uptime":...,"database":"connected","redis":"connected"}
```

### Task Operations (PowerShell)

```powershell
# Create a task
$body = @{
    title = "Test Task"
    description = "Testing the API"
    priority = "HIGH"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:2999/api/tasks" -Method POST -Body $body -ContentType "application/json"

# Get all tasks
Invoke-RestMethod -Uri "http://localhost:2999/api/tasks"

# Get specific task
Invoke-RestMethod -Uri "http://localhost:2999/api/tasks/1"

# Update task
$updateBody = @{
    status = "completed"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:2999/api/tasks/1" -Method PATCH -Body $updateBody -ContentType "application/json"

# Delete task
Invoke-RestMethod -Uri "http://localhost:2999/api/tasks/1" -Method DELETE
```

### Task Operations (curl)

```bash
# Create a task
curl -X POST http://localhost:2999/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Testing","priority":"HIGH"}'

# Get all tasks
curl http://localhost:2999/api/tasks

# Update task
curl -X PATCH http://localhost:2999/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Delete task
curl -X DELETE http://localhost:2999/api/tasks/1
```

## 🎯 Development Modes

### Hybrid Development (Recommended)

```bash
# Backend in Docker, Frontend local
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db redis api
cd frontend && npm run dev

# Access points:
# Frontend: http://localhost:3001 (local)
# API: http://localhost:2999 (Docker)
# DB Admin: http://localhost:5555
```

### Full Docker Development

```bash
# Everything in Docker
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Access points:
# Frontend: http://localhost:3001 (Docker)
# API: http://localhost:2999 (Docker)
```

### Local Backend Development

```bash
# Database in Docker, Backend local
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d db redis
cd backend && npm run start:dev

# Uses alternative ports: DB:5433, Redis:6380
```

## 🛠️ Troubleshooting

### Common Issues

```bash
# Port conflicts
netstat -ano | findstr :2999
taskkill /PID <process_id> /F

# Docker issues
docker system prune -f
npm run rebuild

# Frontend issues
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev

# Prisma client issues
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api npx prisma generate
```

### Service URLs

- **Frontend**: http://localhost:3001
- **API**: http://localhost:2999
- **API Health**: http://localhost:2999/api/health
- **Database Admin**: http://localhost:5555 (after running
  `npm run prisma:studio`)
- **Database**: localhost:5433 (local) / localhost:5432 (Docker)
- **Redis**: localhost:6380 (local) / localhost:6379 (Docker)

## 📁 Project Structure Quick Reference

```
taskforge/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── health/         # Health check endpoints
│   │   ├── tasks/          # Task CRUD operations
│   │   ├── prisma/         # Database service
│   │   └── redis/          # Caching service
│   └── prisma/             # Database schema & migrations
├── frontend/               # Nuxt 3 SPA
│   ├── app/                # Pages and layouts
│   ├── composables/        # Reusable logic
│   └── plugins/            # PrimeVue setup
├── scripts/                # Development utilities
└── docker-compose*.yml     # Container orchestration
```

## 🔄 Git Workflow

### Pre-commit Checks

```bash
# Automatic checks on commit (via Husky)
git add .
git commit -m "feat: add new feature"

# Manual quality checks
npm run lint
npm run format
npm test
```

### Branch Management

```bash
# Create feature branch
git checkout -b feature/new-feature

# Push and create PR
git push -u origin feature/new-feature
```

## 📊 Monitoring & Debugging

### Performance Monitoring

```bash
# Check container resource usage
docker stats

# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:2999/api/health
```

### Debug Mode

```bash
# Backend debug mode
cd backend
npm run start:debug

# Frontend debug mode
cd frontend
npm run dev -- --debug
```

## 🆕 Recent Updates & Fixes

### Current Configuration (September 2025)

- **ESLint:** Unified flat config (v9) with CLI utilities
- **Prettier:** Integrated formatting with consistent rules
- **Docker:** Optimized builds with proper Prisma client handling
- **Build Process:** Full clean build verification completed

### Verified Working Commands

```bash
# Code quality (unified configuration)
npm run lint            # Lint all code
npm run lint:fix        # Fix linting issues
npm run format          # Check formatting
npm run format:fix      # Fix formatting

# Full system rebuild (tested and working)
npm run rebuild

# Development (recommended approach)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db redis api
cd frontend && npm run dev
```

### Build & Deployment Verification

```bash
# Full clean build process (verified working)
npm run rebuild
docker compose ps                           # Check all services
curl http://localhost:2999/api/health      # Test API
start http://localhost:3001                # Test frontend

# Production build testing
npm run build
docker compose -f docker-compose.yml up -d
```

---

_Keep this cheatsheet handy for quick reference during development!_
