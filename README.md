Modern Fullstack Starter - Vite + Tailwind (Frontend) + Express + Postgres (sessions) + Mongo (NoSQL)

Quickstart (development):
1. Copy .env.example -> .env and edit if needed.
2. Run: docker compose up --build
3. Seed DB: docker compose run --rm seed
4. Frontend: http://localhost:3000, Backend API: http://localhost:5000

Features:
- Frontend: Vite + React 18 + TailwindCSS, fast HMR
- Backend: Express, sessions stored in Postgres (connect-pg-simple), Mongo via Mongoose
- Docker Compose with Postgres and Mongo
