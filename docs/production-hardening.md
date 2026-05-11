# Production Hardening Checklist

This checklist maps every production hardening requirement to its current implementation status and the required operational steps for deployment. "Implemented" means the repository already enforces the control. "Ops runbook" means the repo provides configuration guidance and the operator must finish setup.

## Environments and credentials
- **Separate dev/staging/prod databases** — **Implemented** via `APP_ENV` + `DATABASE_URL_*` scoping (`backend/src/config/environment.js`, `backend/src/config/database.js`).
- **Use three environments (local/staging/prod)** — **Implemented** in env scoping + deployment docs; keep `APP_ENV` explicit per environment.
- **Separate dev/prod API keys** — **Implemented** via environment-scoped keys (`*_LOCAL`, `*_STAGING`, `*_PRODUCTION`).
- **Keep `.env` out of git** — **Implemented** in `.gitignore`.
- **Never paste secrets into AI chats** — **Ops runbook**; enforce team policy and rotate if exposed.
- **Rotate credentials seen by AI** — **Ops runbook**; rotate per environment and record incident.

## Database safety & lifecycle
- **Use UUIDs for public IDs** — **Implemented** (`@default(uuid())` across Prisma models).
- **Soft deletes instead of hard deletes** — **Implemented** for user-impacting data with delete routes (`Document`, `Notification`, `ChatMessage`, `CropCalendar`) and filtered reads. Extend the same pattern when adding new delete endpoints.
- **Audit fields on every table** — **Partially implemented** (`createdAt`/`updatedAt` on most tables + Activity logging for writes). If you need per-table `created_by`/`updated_by`, add fields via Prisma migrations.
- **Add database indexes** — **Partially implemented** (indexes exist on high-traffic tables). Review query hotspots and add missing indexes using Prisma migrations before scale.
- **Use migration files for DB changes** — **Implemented** (`db:migrate`, `db:migrate:deploy`; `db:push` blocked).

## Backups & restore testing
- **Automated daily backups outside hosting provider** — **Ops runbook**:
  1. Schedule `pg_dump` on the DB host or a trusted worker.
  2. Upload encrypted archives to external storage (S3/Backblaze/Drive).
  3. Retain at least 30–90 days of backups.
- **Test backup restoration** — **Ops runbook**:
  1. Restore the latest backup to a temporary database weekly.
  2. Run a sanity query set (row counts, key tables, checksum if available).
  3. Record restore time and data integrity check results.

## Authentication & authorization
- **Use managed auth providers** — **Implemented for frontend via Supabase Auth**; backend additionally supports JWT auth. Prefer managed auth for new flows.
- **Test authorization properly** — **Ops runbook**: regularly test cross-user access with role-based test accounts.
- **Secure session cookies** — **Not applicable to API JWT auth** (no server sessions). For any cookie-based auth, enforce `Secure`, `HttpOnly`, `SameSite`.
- **Require re-auth for sensitive actions** — **Ops runbook**: require OTP or password confirmation for account deletion/email change/export flows when implemented.

## Admin tooling & auditing
- **Build a proper admin panel** — **Implemented** in frontend admin views; keep expanding with controlled operations.
- **Protect admin panel with separate security** — **Implemented** with role-based access; consider MFA at the auth provider.
- **Store admin role in database** — **Implemented** via `User.role = ADMIN`.
- **Log every admin action (old vs new)** — **Implemented** via Activity logging; admin update routes attach before/after audit metadata where available.
- **Use separate staging admin accounts** — **Ops runbook**: provision non-founder admin accounts for staging.

## Input validation & uploads
- **Validate all input server-side** — **Implemented for auth + critical routes; expanding coverage is recommended**. Continue adding validation to every new endpoint.
- **Restrict upload size and file types** — **Implemented** via Multer limits and MIME allowlists.
- **Sanitize user-generated content** — **Implemented** for forum posts/comments, chat messages, polls, and profile text fields.

## Abuse protection & cost controls
- **Add rate limiting** — **Implemented** with global + route-specific limiters.
- **Limit AI usage per user** — **Ops runbook**: add quota tracking before launch; current API rate limiting is in place.
- **Prevent infinite paid API loops** — **Ops runbook**: enforce retry limits/timeouts in AI clients and add circuit breakers.
- **Set spending limits on services** — **Ops runbook**: configure provider-level budgets and caps.
- **Enable real-time billing alerts** — **Ops runbook**: configure phone/SMS/email alerts in cloud billing.

## Security headers, transport & monitoring
- **Disable debug mode in production** — **Implemented** (production config + error handler).
- **Restrict CORS properly** — **Implemented** via `FRONTEND_URL` allowlist.
- **Use HTTPS everywhere** — **Implemented** via `FORCE_HTTPS` middleware (set `FORCE_HTTPS=true` in production).
- **Add health checks and monitoring** — **Implemented** with `/health` + `/metrics` endpoints; integrate uptime monitoring.
- **Centralize error logging** — **Implemented** with Sentry + structured logs.
- **Never log sensitive data** — **Implemented** with activity log redaction and guidance.
- **Keep logs for minimum 30 days** — **Ops runbook**: configure log retention in the hosting provider.
- **Configure SPF/DKIM/DMARC** — **Ops runbook**: configure on email domain + provider.
- **Configure critical alerts** — **Ops runbook**: add alerts for failures, error spikes, traffic spikes, downtime.

## Product/legal readiness
- **Maintain product documentation** — **Implemented** under `docs/`.
- **Get human security review** — **Ops runbook** before launch.
- **Add privacy policy and terms** — **Ops runbook**: add `/privacy` and `/terms` pages before collecting real user data.
- **Understand compliance laws** — **Ops runbook** (GDPR/DPDP/CCPA/HIPAA as applicable).
- **Build real account deletion** — **Ops runbook**: implement deletion/anonymization flow.
- **Add cookie consent for EU users** — **Ops runbook** for analytics/cookie usage.

## Disaster recovery & maintenance
- **Document disaster recovery steps** — **Ops runbook**: maintain an internal DR playbook (backup restore, key rotation, failover).
- **Add maintenance mode** — **Implemented** via `MAINTENANCE_MODE=true` (returns 503 for non-health endpoints).

## Shared access & governance
- **Ensure shared access to critical accounts** — **Ops runbook**: document secondary owners for hosting, domains, databases, and billing.

---

### Runbook pointers
- **Env scoping**: see `backend/.env.example` and `docs/deployment.md`.
- **Soft delete policy**: see `docs/database.md`.
- **Security posture**: see `docs/security.md`.
