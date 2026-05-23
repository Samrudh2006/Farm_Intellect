# Farm Intellect

Farm Intellect is a Vite + React web application with a Node/Express backend for AI-assisted agriculture workflows.

## Repository structure

- `src/` – frontend application
- `backend/` – Express API, ingestion jobs, AI/voice services
- `supabase/` – Supabase schema/functions used by the app
- `docs/` – project documentation (single source for detailed docs)

## Architecture decisions

- **Frontend auth/data client:** Supabase (`@supabase/supabase-js`)
- **Server runtime:** Express backend (`backend/`)
- **Package manager:** **npm** (single lockfile: `package-lock.json`)
- **Secrets:** provider/API secrets are server-side only; browser config uses public-safe `VITE_*` values only.

## Getting started

### Frontend

```bash
npm ci
cp .env.example .env
npm run dev
```

### Backend

```bash
cd backend
npm ci
cp .env.example .env
npm run dev
```

## Validation

```bash
npm run lint
npm run test
npm run build

cd backend
npm run test
```

## Documentation index

- Security policy: [SECURITY.md](SECURITY.md)
- Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- System and operations docs: [docs/](docs)
- Archived historical status reports: [docs/archive/top-level-reports/](docs/archive/top-level-reports)

## Deployment note

- Set `VITE_ROBOTS_POLICY=index, follow` for production builds.
- Keep `VITE_ROBOTS_POLICY=noindex, nofollow` for preview/staging builds.
