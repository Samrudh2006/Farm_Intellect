# Deployment Guide

## Deployment topology

### Frontend
- Vite SPA
- deployable to Vercel

### Backend
- Node.js Express service
- deploy separately (Render, Railway, Fly.io, Azure App Service, VPS, etc.)

### Auth / managed services
- Supabase project for authentication and profile tables

## Required environment variables

### Frontend `.env`

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_OWM_API_KEY`

### Backend `.env`

Recommended:

- `PORT=3001`
- `NODE_ENV=production`
- `APP_ENV=production`
- `FRONTEND_URL=https://your-frontend-domain`
- `DATABASE_URL_PRODUCTION=postgresql://user:password@host:5432/farm_intellect_prod?schema=public`
- `DATABASE_URL_STAGING=postgresql://user:password@staging-host:5432/farm_intellect_staging?schema=public`
- `DATABASE_URL_LOCAL=postgresql://user:password@localhost:5432/farm_intellect_local?schema=public`
- `JWT_SECRET=<strong-random-secret>`
- `JWT_EXPIRES_IN=7d`
- `BCRYPT_ROUNDS=12`
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX_REQUESTS=100`
- `MAX_FILE_SIZE=10485760`
- database connection settings if moving beyond SQLite

## Frontend build

```bash
npm install
npm run build
```

## Backend run

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run start
```

## Environment separation policy

- keep independent credentials and databases for `local`, `staging`, and `production`
- never point local/staging apps to production databases
- never reuse production API keys for staging/local integrations
- set `APP_ENV` explicitly in each environment so scoped secrets are selected correctly

## Migration-only database change workflow

- use `npm run db:migrate` for local schema changes
- commit migration files under `backend/prisma/migrations`
- deploy schema changes with `npm run db:migrate:deploy` in staging/production
- `db:push` is intentionally blocked to prevent uncontrolled schema drift

## Vercel notes

The repository already includes `vercel.json` for SPA routing support.

## Supabase notes

- ensure redirect URLs match the deployed frontend domain
- keep `verify_jwt = true` for protected edge functions
- keep leaked password protection enabled

## Production checklist

- rotate all exposed or previously hardcoded secrets
- set production CORS origin to the actual frontend domain
- configure persistent storage for uploads if needed
- provision a managed PostgreSQL instance and run Prisma migrations
- configure logs retention and alerting
- enable HTTPS end to end

## Recommended deployment model

```mermaid
flowchart LR
    Browser --> Vercel[Frontend on Vercel]
    Vercel --> Supabase[Supabase Auth]
    Vercel --> Backend[Express Backend]
    Backend --> Postgres[(Production Database)]
    Backend --> ObjectStorage[File/Object Storage]
```

## CI/CD

A GitHub Actions workflow now exists at `.github/workflows/ci.yml` for:

- frontend lint
- frontend tests
- frontend build
- backend tests
