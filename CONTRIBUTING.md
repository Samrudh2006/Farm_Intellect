# Contributing

## Development setup

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

## Required checks before PR

```bash
npm run lint
npm run test
npm run build

cd backend
npm run test
```

## Contribution rules

- Use **npm** (do not commit Bun lockfiles).
- Keep secrets out of frontend/browser code.
- Treat `VITE_*` as public.
- Put server-only dependencies in `backend/package.json`.
- Update docs in `README.md`, `SECURITY.md`, `CONTRIBUTING.md`, or `docs/`.
- Keep changes scoped and include tests for changed behavior when practical.

## Documentation policy

- Top-level canonical docs: `README.md`, `SECURITY.md`, `CONTRIBUTING.md`.
- Detailed design/ops docs live in `docs/`.
- Historical status reports belong in `docs/archive/`.
