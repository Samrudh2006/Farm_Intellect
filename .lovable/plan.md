# Status Report & Next Steps

## 1. Is it connected? (Answer to your questions)

**Frontend ↔ Lovable Cloud (Supabase):** YES, connected.
- `.env` has real `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.
- `hasSupabaseEnv` evaluates to **true** → real Supabase auth + database + 20+ Edge Functions are live.

**Login mode right now:** REAL, not mock.
- Mock login only activates when `hasSupabaseEnv` is false (env missing). Since env is set, signup/signin hit real Supabase Auth.
- The mock code paths (`mock_user_session`, `mock_registered_users` in `AuthContext.tsx`) are dead code in current config — safe fallback for local dev only.

**Backend on Render:** NO. There is no Render deployment.
- The `/backend` Node.js/Express app exists in the repo but is **not deployed anywhere** and the frontend never calls it (no `VITE_API_URL` / no Render URL references anywhere in `src/`).
- All backend logic the app actually uses runs as **Supabase Edge Functions** (`supabase/functions/*`): chat, voice-chat, voice-transcribe, voice-tts, send-otp, verify-otp, weather, market-prices, generate-alerts, sms-dispatcher, etc.
- Decision needed: either delete `/backend` (dead weight) or deploy it to Render and wire it up.

## 2. Where mock data still lives

Files still using localStorage mock fallbacks instead of Supabase tables:

| File | Mock storage key | Should use table |
|---|---|---|
| `src/pages/expert/ExpertKnowledgeHub.tsx` | `mock_knowledge_articles` | `knowledge_articles` (exists) |
| `src/pages/expert/ExpertConsultations.tsx` | `mock_consultations` | `consultations` (exists) |
| `src/pages/merchant/MerchantOrders.tsx` | `mock_orders` | `orders` (exists) |
| `src/pages/merchant/MerchantFarmers.tsx` | `DEFAULT_MOCK_FARMERS` fallback | `profiles` where role=farmer |
| `src/pages/Advisory.tsx` | inline `mockAdvisory` array | needs table or AI-generated content |
| `src/pages/Crops.tsx`, `Dashboard.tsx`, `Polls.tsx` | scattered fallbacks | verify per-page |
| `src/components/features/YieldProfitEstimator.tsx` | mock numbers | tie to real crop data |

All the target tables already exist with RLS — the pages just need to query Supabase instead of localStorage.

## 3. APK status (recap)

Your current APK reads `capacitor.config` with `server.url` pointing at the Lovable preview URL → it's a **web wrapper**, not a self-contained offline APK. Works only while that URL is live. For a proper Play Store build we need to remove `server.url` and ship `dist/` locally.

## 4. What's NOT ready yet (honest gap list)

- ❌ Mock data in 6+ pages listed above
- ❌ `/backend` Node service undeployed and unused — decide keep/kill
- ❌ APK is remote-wrapper, not production offline build
- ❌ No Sentry / error monitoring wired in production
- ❌ Native FCM push (currently Web Notification API only — no background push on closed app)
- ❌ Live mandi price sync cron (function exists, not scheduled)
- ⚠️ TypeScript still has ~10 non-blocking warnings in `supabaseApi.ts`

## 5. Proposed Plan (do this next)

**Phase A — Remove all mock data (highest priority)**
1. Rewrite `ExpertKnowledgeHub.tsx` to CRUD `knowledge_articles` table.
2. Rewrite `ExpertConsultations.tsx` to CRUD `consultations` table.
3. Rewrite `MerchantOrders.tsx` to CRUD `orders` table.
4. Rewrite `MerchantFarmers.tsx` to query `profiles` where role='farmer'.
5. Replace `Advisory.tsx` mock array with Supabase-backed advisory feed (new small table OR reuse `notifications`).
6. Audit `Dashboard.tsx`, `Crops.tsx`, `Polls.tsx`, `YieldProfitEstimator.tsx` and replace remaining fallbacks.
7. Delete `mock_user_session` / `mock_registered_users` fallback branches from `AuthContext.tsx` and `useCurrentUser.ts` (no longer needed since env is always set).

**Phase B — Backend decision**
- Option 1 (recommended): **Delete `/backend`** folder — everything already runs on Supabase Edge Functions, no reason to maintain a parallel Node service.
- Option 2: Deploy `/backend` to Render, add `VITE_API_URL`, and wire specific routes.
  → I need your call before I touch this.

**Phase C — Production APK**
1. Remove `server.url` from `capacitor.config.ts`.
2. `npm run build` → `npx cap sync android`.
3. Generate signed release AAB in Android Studio.

**Phase D — Ops polish**
- Schedule `generate-alerts` and `sync-mandi-prices` cron via Supabase.
- Add Sentry DSN.
- Set up native FCM (requires Firebase project + `google-services.json`).

## Questions before I start Phase A

1. **Backend `/backend` folder:** delete it (Option 1) or deploy to Render (Option 2)?
2. Should I do Phase A in one big pass (all 6 pages), or one page at a time so you can review each?
