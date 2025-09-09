# TaskForge

A modern full-stack task management application built as a technical showcase
project.

## 🎯 Project Overview

TaskForge demonstrates a production-ready architecture with:

- **Backend:** RESTful API with Redis caching, validation, and database
  migrations
- **Frontend:** Modern SPA with PrimeVue component library and responsive design
- **Infrastructure:** Containerized development environment with hot reload
- **Code Quality:** Automated linting, formatting, and type checking
- **Monorepo Structure:** Shared dependencies and unified development workflow

## 🚀 Tech Stack

### Backend

- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[Prisma](https://www.prisma.io/)** - Type-safe database ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Redis](https://redis.io/)** - In-memory caching layer

### Frontend

- **[Nuxt 3](https://nuxt.com/)** - Vue.js meta-framework (v3.12.4)
- **[PrimeVue](https://primevue.org/)** - Rich UI component library (Aura theme)
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Pinia](https://pinia.vuejs.org/)** - State management for Vue

### Infrastructure & DevOps

- **[Docker Compose](https://docs.docker.com/compose/)** - Multi-container
  orchestration
- **[ESLint 9](https://eslint.org/) + [Prettier](https://prettier.io/)** - Code
  quality tools with unified flat config
- **Node.js 20+** - Runtime environment (Alpine Linux in containers)

## ⚙️ Requirements

- **[Node.js](https://nodejs.org/) >= 20.0.0**
- **[npm](https://www.npmjs.com/) >= 10.0.0**
- **[Docker Desktop](https://www.docker.com/products/docker-desktop)** with
  Compose V2

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd taskforge
npm install
```

### 2. Environment Configuration

Copy the example environment files:

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

**Backend `.env.example`:**

```env
# Database Configuration
DATABASE_URL="postgresql://taskforge:taskforge@db:5432/taskforge"
REDIS_URL="redis://redis:6379"

# API Configuration
PORT=2999
NODE_ENV=development
```

**Frontend `.env.example`:**

```env
# API Configuration
NUXT_PUBLIC_API_BASE=http://localhost:2999/api

# Server Configuration (for Docker)
NUXT_HOST=0.0.0.0
NUXT_PORT=3001
```

> **Note:** The example files contain Docker-optimized settings. For local
> development outside Docker, you may need to change service hostnames from
> `db`/`redis` to `localhost`.

### 3. Development Setup

#### Option A: Full Docker Setup

Start all services in Docker containers:

```bash
# Start all services (PostgreSQL + Redis + API + Frontend)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Run database migrations
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api npx prisma migrate deploy

# Check service health
curl http://localhost:2999/api/health
```

#### Option B: Hybrid Development (Recommended)

Use Docker for backend services and local development for frontend:

```bash
# Start backend services in Docker
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db redis api

# Wait for services to be ready, then start frontend locally
cd frontend
npm run dev
```

This approach provides:

- ✅ **Stable backend services** in Docker containers
- ✅ **Fast frontend development** with native Node.js
- ✅ **Better compatibility** avoiding Docker-specific issues
- ✅ **Hot reload** for both backend and frontend

**Access Points:**

- 🌐 **Frontend:** http://localhost:3001
- 🔧 **API:** http://localhost:2999
- 📊 **API Health:** http://localhost:2999/api/health
- 📊 **Database Admin:** http://localhost:5555 (run: `npm run prisma:studio`)

### 4. Full System Rebuild (When Needed)

For a clean start or when switching development modes:

```bash
# Complete rebuild: stops containers, cleans dependencies, rebuilds images, starts services
npm run rebuild
```

This enhanced script will:

- Stop and remove all containers and volumes
- Clean node_modules and lock files
- Remove Docker images and build cache
- Build fresh Docker images
- Start services with health checks and monitoring
- Install host dependencies
- Run database migrations
- Display service URLs and status

### 5. Alternative: Full Docker Setup

If you prefer running everything in Docker:

```bash
# Start all services (PostgreSQL + Redis + API + Frontend)
npm run start

# Run database migrations
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api npx prisma migrate deploy

# Check service health
curl http://localhost:2999/api/health
```

**Note:** Frontend in Docker may experience Rollup binary compatibility issues.
Use local development if you encounter problems.

### 6. Verify Installation

Test the API endpoints:

```bash
# Health check
curl http://localhost:2999/api/health

# List tasks
curl http://localhost:2999/api/tasks

# Create a test task (PowerShell)
$body = @{
    title = "Test Task"
    description = "Testing the API after setup"
    priority = "HIGH"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:2999/api/tasks" -Method POST -Body $body -ContentType "application/json"

# Or using curl (if available)
curl -X POST http://localhost:2999/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Testing the API","priority":"HIGH"}'
```

Expected API responses:

- **Health check**:
  `{"status":"ok","timestamp":"...","uptime":...,"database":"connected","redis":"connected"}`
- **Task creation**: Returns task object with `id`, `title`, `description`,
  `status`, `createdAt`, `updatedAt`

Open the frontend at http://localhost:3001 and verify:

- ✅ Task list loads without errors
- ✅ "New Task" button opens dialog
- ✅ Can create, edit, and delete tasks
- ✅ Status badges display correctly
- ✅ Real-time updates work properly

## 📋 **Available Commands**

### Development Commands

```bash
# Full system rebuild (recommended for clean start)
npm run rebuild          # Enhanced rebuild: clean + build + start + health checks + URLs

# Service management
npm run start           # Start all services (including frontend)
npm run stop            # Stop all services
npm run restart         # Restart all services
npm run clean           # Clean Docker resources (images, volumes, containers)

# Build commands
npm run build           # Build both backend and frontend
npm run build:backend   # Build backend only
npm run build:frontend  # Build frontend only

# Testing
npm run test            # Run backend tests
npm run test:backend    # Run backend tests (alias)

# Recommended hybrid development
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db redis api
cd frontend && npm run dev  # Run frontend locally for best experience

# Logs and monitoring
npm run logs            # View all service logs
npm run logs:api        # View API logs only
npm run logs:frontend   # View frontend logs only
npm run logs:db         # View database logs only
npm run logs:redis      # View Redis logs only

# Code quality (unified ESLint 9 flat config)
npm run lint            # Lint all code with unified configuration
npm run lint:fix        # Fix linting issues and formatting automatically
npm run format          # Check code formatting with Prettier
npm run format:check    # Check code formatting (without fixes)

# Database management
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
npm run prisma:studio   # Open database admin UI
```

### Local Development Commands

```bash
# For local backend development (Windows support)
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d db redis
cd backend && npm run start:dev

# Backend-specific commands (run in backend/ directory)
npm run start:dev       # Start with hot reload
npm run start:local     # Start with local environment (.env.local)
npm run build           # Build for production
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:cov        # Run tests with coverage
npm run test:debug      # Run tests in debug mode
npm run test:e2e        # Run end-to-end tests

# Frontend-specific commands (run in frontend/ directory)
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Start production server
```

## 🚀 **System Verification After Full Rebuild**

### Step 1: Complete Rebuild

```bash
# Ensure Docker Desktop is running, then:
npm run rebuild
```

The rebuild process will:

1. ✅ Stop and remove containers/volumes
2. ✅ Clean node_modules and lock files
3. ✅ Remove Docker images and build cache
4. ✅ Build fresh Docker images
5. ✅ Start services with health checks
6. ✅ Install host dependencies
7. ✅ Generate Prisma client
8. ✅ Run database migrations

### Step 2: API Verification

```bash
# Check health endpoint (should return status: "ok")
Invoke-RestMethod -Uri "http://localhost:2999/api/health"

# Create a test task
$body = @{
    title = "Test After Rebuild"
    description = "Testing API after successful rebuild"
    priority = "HIGH"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:2999/api/tasks" -Method POST -Body $body -ContentType "application/json"

# Get all tasks
Invoke-RestMethod -Uri "http://localhost:2999/api/tasks"
```

Expected responses:

- **Health**: `{"status":"ok","database":"connected","redis":"connected"}`
- **Task creation**: Returns task object with ID and timestamps
- **Task list**: Returns paginated task list with metadata

### Step 3: Frontend Verification (Optional)

The frontend has known issues with native bindings in Docker. To start it
manually:

```bash
# Start frontend container
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d frontend

# Check frontend availability (may take time to start)
curl -I http://localhost:3001
# or open in browser: http://localhost:3001
```

**Alternative:** Run frontend locally for development:

```bash
cd frontend
npm run dev
# Opens at http://localhost:3000
```

````

### Step 4: Logs Verification

```bash
# Check logs for all services
npm run logs

# Check specific services
docker compose logs api
docker compose logs frontend
docker compose logs db
docker compose logs redis
````

### Expected Results:

- ✅ API health endpoint returns status "ok"
- ✅ Can create and retrieve tasks via API
- ✅ Frontend is accessible on port 3001
- ✅ All services are running without errors

## 🛠️ Development Workflow

### Local Development with WebStorm/IntelliJ

For optimal development experience, you can run the backend locally while using
Docker for database services:

#### WebStorm Run Configuration

Create a new **npm** run configuration in WebStorm:

- **Name**: `backend`
- **package.json**: `C:\Work\taskforge\backend\package.json`
- **Command**: `run`
- **Scripts**: `start:dev`
- **Node interpreter**: Use your local Node.js installation
- **Package manager**: npm

#### Setup Steps:

1. **Start database services only:**

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.local.yml up -d db redis
   ```

2. **Create local environment file:**

   ```bash
   # Copy the local development template
   cp backend/.env.local.example backend/.env.local
   ```

3. **Generate Prisma client for Windows:**

   ```bash
   cd backend
   npx prisma generate
   ```

4. **Run backend from WebStorm** using the configuration above, or manually:
   ```bash
   cd backend
   npm run start:dev
   ```

#### Local Development Benefits:

- ✅ **Windows Prisma Client** support (automatic binary target detection)
- ✅ **Hot reload** with file watching
- ✅ **IDE debugging** with breakpoints
- ✅ **Faster compilation** (no Docker overhead)
- ✅ **Alternative ports** (5433 for DB, 6380 for Redis) to avoid conflicts

### Database Migrations

```bash
# Run pending migrations (Docker)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api npx prisma migrate deploy

# Run pending migrations (Local)
cd backend && npx prisma migrate deploy

# Create new migration
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api npx prisma migrate dev --name your_migration_name

# View database in Prisma Studio
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api npx prisma studio
# Opens at http://localhost:5555
```

### Rebuild & Cleanup Scripts

**Full rebuild** (recommended when switching between local/Docker development):

```bash
npm run rebuild
```

**Quick cleanup** (removes dependencies and Docker resources):

```bash
npm run clean
```

**Manual rebuild** (after cleanup):

```bash
npm install
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

### Code Quality & Formatting

The project uses a **unified ESLint 9 flat configuration** (`eslint.config.mjs`)
with integrated Prettier for consistent code style across both backend and
frontend:

```bash
# Unified linting and formatting commands
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

**Code Quality Features:**

- ✅ **Unified ESLint 9 flat config** with CLI utilities for all projects
- ✅ **TypeScript strict mode** with comprehensive type checking
- ✅ **Prettier integration** with consistent formatting rules
- ✅ **Automated brace-style enforcement** for consistent code structure
- ✅ **Cross-platform compatibility** for Windows & Linux development

### Post-Rebuild Verification

After a full rebuild, verify everything works:

```bash
# 1. Check all services are running
docker compose -f docker-compose.yml -f docker-compose.dev.yml ps

# 2. Test API endpoints
Invoke-RestMethod -Uri "http://localhost:2999/api/health"

# 3. Create a test task (PowerShell)
$body = @{
    title = "Post-Rebuild Test"
    description = "Verifying system after rebuild"
    priority = "HIGH"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:2999/api/tasks" -Method POST -Body $body -ContentType "application/json"

# 4. Get all tasks
Invoke-RestMethod -Uri "http://localhost:2999/api/tasks"

# 5. Verify frontend loads at http://localhost:3001

# 6. Run code quality checks
npm run lint
npm run format
```

### Development Commands

```bash
# View logs
npm run logs                      # All service logs
npm run logs:api                  # Backend logs only
npm run logs:frontend             # Frontend logs only

# Execute commands in containers
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api npm run lint
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api npx prisma studio

# Restart specific service
docker compose -f docker-compose.yml -f docker-compose.dev.yml restart api
```

## 🚨 Known Issues & Solutions

### Frontend Docker Compatibility

The frontend has been configured to work in Docker with Alpine Linux, but may
occasionally experience native binding issues.

**Current Status:**

- ✅ **Backend services** are fully stable and production-ready
- ✅ **Frontend** works in Docker with proper configuration
- ✅ **ESLint** configured with simplified rules for better compatibility
- ✅ **Nuxt 3.12.4** used for better stability

**Recommended Development Approach:**

Use the **hybrid development approach** for optimal experience:

```bash
# Start backend services in Docker
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db redis api

# Run frontend locally for best performance
cd frontend
npm run dev  # Runs on http://localhost:3001
```

**Benefits:**

- ✅ **Faster development** with native Node.js performance
- ✅ **Better hot reload** and debugging experience
- ✅ **Stable backend services** in isolated containers
- ✅ **No compatibility issues** with native bindings

**If Docker Frontend Issues Occur:**

1. **Use the rebuild script**:

   ```bash
   npm run rebuild
   ```

2. **Manual container rebuild**:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache frontend
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d frontend
   ```

## 📡 API Endpoints

### Tasks API

```http
GET    /api/tasks              # List tasks (with pagination & filtering) - Cached 5min
POST   /api/tasks              # Create new task - Invalidates cache
GET    /api/tasks/:id          # Get task by ID - Cached 10min
PATCH  /api/tasks/:id          # Update task - Invalidates cache
DELETE /api/tasks/:id          # Delete task - Invalidates cache
```

### Health Check

```http
GET    /api/health             # Service health status (DB + Redis)
```

### Query Parameters

```http
GET /api/tasks?status=pending&search=test&page=1&limit=10
```

**Available filters:**

- `status`: `pending` | `in-progress` | `completed` | `cancelled`
- `search`: Search in title and description
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

## 📁 Project Structure

```
taskforge/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── health/         # Health check module
│   │   ├── tasks/          # Tasks CRUD module
│   │   ├── prisma/         # Database service
│   │   └── redis/          # Caching service
│   ├── prisma/             # Database schema & migrations
│   └── test/               # E2E tests
├── frontend/               # Nuxt 3 SPA
│   ├── app/                # Pages and layouts
│   ├── composables/        # Reusable logic
│   └── plugins/            # PrimeVue configuration
├── scripts/                # Development utilities
│   ├── rebuild.js          # Full rebuild script
│   ├── clean.js            # Cleanup script
│   └── dev-local.js        # Local development
├── docker-compose.yml      # Production services
├── docker-compose.dev.yml  # Development overrides
└── package.json            # Shared dependencies & scripts
```

## 🏗️ Architecture Decisions

### Backend Architecture

- **NestJS Modules:** Clean separation of concerns (Health, Tasks, Prisma)
- **Prisma ORM:** Type-safe database queries with automatic migrations
- **Redis Caching:** Task list caching with status-based invalidation
- **Validation:** Class-validator for request DTOs
- **Error Handling:** Global exception filters

### Frontend Architecture

- **Nuxt 3 (SPA Mode):** Single Page Application with file-based routing
- **PrimeVue Aura:** Consistent UI components and theming
- **Pinia:** State management for Vue applications
- **Composables:** Reusable logic for API calls and state management
- **TypeScript:** Full type safety across the application
- **ESLint Flat Config:** Modern linting configuration

### Infrastructure

- **Docker Multi-stage:** Optimized production builds
- **Volume Mounts:** Hot reload in development
- **Health Checks:** Container and service monitoring
- **Environment Isolation:** Separate configs for dev/prod

## 📜 Available Scripts

### Root Scripts

```bash
npm run rebuild     # Full project rebuild (nuclear option)
npm run clean       # Quick cleanup of dependencies and Docker
```

### Backend Scripts

```bash
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run format      # Check formatting with Prettier
npm run format:fix  # Fix formatting with Prettier
npm run start:dev   # Run NestJS in watch mode
```

### Frontend Scripts

```bash
npm run dev         # Start Nuxt 3 in dev mode (HMR)
npm run build       # Build production bundle
npm run preview     # Preview production build
```

## 🐞 Troubleshooting

### Common Issues

**Port conflicts (5432/6379/2999/3001):**

```bash
# Check what's using the port
netstat -ano | findstr :2999

# Kill the process (Windows)
taskkill /PID <process_id> /F
```

**Docker build issues:**

```bash
# Clean rebuild everything
npm run rebuild

# Or manual cleanup
docker compose down -v
docker system prune -f
docker compose up --build
```

**Prisma client not found:**

```bash
# Regenerate Prisma client
docker compose exec api npx prisma generate
```

**Frontend not connecting to API:**

- Check that API is running: `curl http://localhost:2999/api/health`
- Verify environment variables in `frontend/.env`
- Check Docker network connectivity

## 🚧 Future Enhancements

- **Testing:** Unit tests with Jest, E2E tests with Playwright
- **CI/CD:** Automated testing and deployment pipelines
- **Monitoring:** Application metrics and logging
- **Security:** Rate limiting, CORS configuration, input sanitization
- **Performance:** Database indexing, query optimization, CDN integration
- **Documentation:** OpenAPI/Swagger documentation for API endpoints
- **Authentication:** User management and JWT-based authentication
- **Real-time Updates:** WebSocket integration for live task updates

## 📄 License

MIT License – free to use, modify, and distribute.
