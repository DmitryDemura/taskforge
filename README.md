# TaskForge

TaskForge is a full-stack task management platform designed as a showcase project.  
It demonstrates a production-ready setup with **NestJS + Prisma + PostgreSQL + Redis** on the backend and **Nuxt 3 + PrimeVue** on the frontend.  
The infrastructure is containerized with Docker Compose and includes developer productivity tools (ESLint, Prettier, Husky, Commitlint, lint-staged).

---

## 🚀 Tech Stack

- **Backend:** [NestJS](https://nestjs.com/), [Prisma](https://www.prisma.io/), [PostgreSQL](https://www.postgresql.org/), [Redis](https://redis.io/)
- **Frontend:** [Nuxt 3](https://nuxt.com/), [PrimeVue](https://primevue.org/)
- **Infrastructure:** [Docker Compose](https://docs.docker.com/compose/), ESLint, Prettier, Husky, Commitlint
- **Language:** TypeScript (Node.js 20+)

---

## ⚙️ Requirements

- [Node.js](https://nodejs.org/) **>= 20**
- [npm](https://www.npmjs.com/) **>= 10**
- [Docker Desktop](https://www.docker.com/products/docker-desktop) with Compose enabled

---

## 🛠️ Setup Instructions

### 1. Clone repository

```bash
git clone https://github.com/<your-username>/taskforge.git
cd taskforge
```

### 2. Environment variables

Copy and adjust the example file:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Full cleanup & rebuild (fresh start)

If you need to reset everything:

```powershell
# Stop and remove containers, networks, and volumes
docker compose down -v --remove-orphans

# Remove node_modules (root + backend + frontend)
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force backend\node_modules
Remove-Item -Recurse -Force frontend\node_modules

# Remove lockfiles
Remove-Item package-lock.json
Remove-Item backend\package-lock.json
Remove-Item frontend\package-lock.json
```

Then reinstall dependencies:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 4. Start infrastructure

```bash
docker compose up -d
```

### 5. Run database migrations

```bash
docker compose exec api npx prisma migrate deploy
```

### 6. Open Prisma Studio (optional)

```bash
docker compose exec api npx prisma studio
```

Studio will be available at [http://localhost:5555](http://localhost:5555).

---

## 📜 Available Scripts

### Backend

```bash
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run format      # Check formatting with Prettier
npm run format:fix  # Fix formatting with Prettier
npm run start:dev   # Run NestJS in watch mode
```

### Frontend

```bash
npm run dev         # Start Nuxt 3 in dev mode
npm run build       # Build production bundle
npm run preview     # Preview production build
```

---

## 🐞 Troubleshooting

- **Port already in use (5432/6379/2999/3000):**  
  Stop conflicting processes (`netstat -ano | findstr :<port>` + `taskkill /PID <id> /F` on Windows).

- **Missing modules (e.g. `class-validator`, `ioredis`):**  
  Ensure you installed backend dependencies inside container:

  ```bash
  docker compose exec api npm install
  ```

- **Prisma errors (`datasource not found`):**  
  Check `.env` contains correct `DATABASE_URL`.

---

## 📌 Notes

- This project uses **Husky + Commitlint** to enforce commit message conventions (`type(scope): subject`).
- All `.env` files are excluded from version control (`.env*`).
- Generated Prisma client files (`backend/generated/`) are ignored in Git.

---

## 📄 License

MIT License – free to use, modify, and distribute.
