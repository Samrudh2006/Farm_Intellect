# Vercel Parity Checklist

Follow this every time the Vercel URL diverges from the Lovable preview.

## 1. Environment variables (Project → Settings → Environment Variables)

Required, exact names:

- `VITE_SUPABASE_URL` — Lovable Cloud project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — anon/publishable key (or `VITE_SUPABASE_ANON_KEY`, either works)
- `VITE_SUPABASE_PROJECT_ID` — project ref
- `VITE_ROBOTS_POLICY` — `index, follow` on production, `noindex, nofollow` elsewhere

Notes:
- `vite.config.ts` now prefers `VITE_*` env vars and only falls back to `SUPABASE_*` / `NEXT_PUBLIC_SUPABASE_*` if those aren't set. Missing values no longer overwrite `import.meta.env` with an empty string.
- Do NOT set `VITE_BASE_PATH` on Vercel. The app builds at `/`. Set it only for a subpath deployment (e.g. GitHub Pages).

## 2. Build settings

- Framework preset: **Vite**
- Build command: `npm run build` (or `bun run build`)
- Install command: `npm ci --legacy-peer-deps`
- Output directory: `dist`
- Node version: 20 (`.nvmrc` optional)

## 3. Routing

SPA rewrites live in `vercel.json`:
```
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
```
Deep links (`/farmer/dashboard`, `/voice-console`, `/admin/*`) work on refresh.

## 4. Git / branch

- Vercel Production Branch must match the branch you're editing in Lovable (usually `main`).
- Confirm the latest commit hash on Vercel matches the latest commit on GitHub. If not, trigger a redeploy.

## 5. Cache purge

If Vercel shows an old bundle after a green deploy:
- Hard reload (Cmd/Ctrl-Shift-R)
- Check Service Worker: DevTools → Application → Service Workers → Unregister, then reload.
  The SW registered in `main.tsx` auto-checks for updates every 60s and prompts the user.

## 6. CSP allow-list

`vercel.json` `Content-Security-Policy` allows `https://*.supabase.co`, Lovable, and Vercel. If you switch backends, extend `connect-src`.

## 7. Sanity smoke test on every deploy

1. Open `/` — index loads, images resolve.
2. Sign in as farmer — reach `/farmer/dashboard`.
3. Open `/voice-console` — Mic works, transcript streams, TTS plays.
4. Refresh `/admin/dashboard` (as admin) — no 404.
5. DevTools Network: no calls to `undefined.supabase.co`.

If any of these fail, re-check step 1 (env vars) first — 90% of "Vercel is old / broken" issues are missing or misnamed VITE_* variables.
