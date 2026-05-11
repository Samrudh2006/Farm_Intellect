# Operations & Security Checklist (Local / Staging / Production)

This repository follows a **three-environment model** and uses **migration-first** database changes.

## 1) Environment Separation
- Local/dev: isolated database + sandbox API keys.
- Staging: production-like data model, non-production credentials.
- Production: real users only.
- Never run destructive tests against production.

## 2) Database Safety
- Use soft deletes (`deletedAt` / `deleted_at`) for user-facing critical records.
- Keep migrations in version control (`supabase/migrations`, `backend/prisma/migrations`).
- Prefer UUID public IDs for externally addressable resources.
- Add indexes for filter/sort/foreign key paths before high-scale rollout.

## 3) Backups & Restore
- Configure automated daily backups to external storage (S3/GCS/Backblaze).
- Test restore at least monthly into a temporary database.
- Validate integrity, restore duration, and schema compatibility.

## 4) Secrets Management
- Never commit `.env` files; use `.env.example` templates only.
- Store secrets in platform secret managers.
- Rotate credentials immediately if exposed.
- Use separate API keys for dev/staging/prod.

## 5) AuthN/AuthZ
- Use managed auth providers (Supabase Auth is configured in this project).
- Enforce server-side authorization checks for cross-user resource access.
- Re-authenticate sensitive actions (account deletion, ownership transfer, exports).
- Protect admin functionality with strict role checks and MFA in deployment.

## 6) API & Upload Security
- Validate all server-side inputs (required fields, formats, enum values, limits).
- Restrict upload MIME type + size limits.
- Keep file path operations constrained to upload roots.
- Apply rate limits to auth/OTP/reset and high-cost endpoints.
- Sanitize user-generated HTML/text before render or broadcast.

## 7) Web/Runtime Security
- Production CORS: trusted origins only.
- HTTPS everywhere.
- Disable debug mode/verbose traces in production.
- Secure cookies: `Secure`, `HttpOnly`, `SameSite`.

## 8) Observability & Incident Readiness
- Centralize logging (Sentry/cloud logs) with retention >= 30 days.
- Never log secrets, tokens, or sensitive PII.
- Configure critical alerts (downtime, error spikes, spend spikes).
- Maintain documented disaster recovery + maintenance mode procedures.

## 9) Cost Controls
- Enforce per-user/per-day quotas for paid AI APIs.
- Add retry caps, timeout guards, and loop stop-conditions.
- Configure budget alerts + hard service caps.

## 10) Governance
- Require human security review before launch of auth/payment/data-export paths.
- Maintain privacy policy, terms, and regional compliance review (GDPR/CCPA/DPDP/HIPAA as applicable).


## Implementation Status (50-control snapshot)



### Not completed yet (to implement)
1. Automated external daily backup job.
2. Scheduled backup restore drill automation.
3. Universal `created_by`/`updated_by` on every table.
4. UUID-only public IDs across all routes.
5. Index review + migrations for all hot query paths.
6. Session cookie hardening flags everywhere applicable.
7. Mandatory re-auth for sensitive account mutations.
8. Separate admin login surface with enforced MFA.
9. Admin action audit trail with old/new diffs.
10. Dedicated staging admin accounts lifecycle policy.

### Newly implemented in this update
- Maintenance mode switch via `MAINTENANCE_MODE=true` returning HTTP 503 for non-health endpoints.
- `x-powered-by` header disabled to reduce fingerprinting.
- `/health` now returns maintenance state for monitoring integrations.
