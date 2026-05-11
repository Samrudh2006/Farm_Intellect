# Security Guide

## Security posture summary

This project has moved from prototype-grade security toward safer full-stack defaults, but it still requires several production hardening steps before real-world scale deployment.

## Production hardening checklist

See `docs/production-hardening.md` for the full requirement-by-requirement checklist, implementation status, and operational runbooks.

## Security improvements already applied

### Secret handling
- OpenWeatherMap API key removed from source code and moved to `.env`
- `.env.example` added for safe onboarding
- `.env` excluded from version control

### Authentication and authorization
- static OTP bypass paths removed from major OTP verification flow
- Socket.IO connection now requires JWT validation
- sensitive document verification routes now use RBAC middleware
- farmer directory route uses RBAC middleware
- Supabase chat edge function JWT verification enabled

### Rate limiting
- global limiter in Express
- route-specific limiters for auth, chat, and AI routes

### Data handling
- Aadhaar and phone removed from insecure local storage persistence paths
- reduced console leakage of identifiers

## Remaining security gaps / next priorities

### High priority
- remove any remaining prototype login shortcuts entirely
- complete request validation coverage for all routes
- expand admin audit logging coverage beyond document verification
- add file upload scanning beyond MIME filtering
- implement CSP hardening with tested asset policy
- add secret rotation runbook and schedule

### Medium priority
- add security headers review for production CDN setup
- add token revocation / session invalidation strategy
- add abuse detection around AI endpoints and uploads
- add database encryption strategy for future regulated fields

## Recommended RBAC matrix

| Action | Farmer | Merchant | Expert | Admin |
|---|---:|---:|---:|---:|
| View own profile | ✅ | ✅ | ✅ | ✅ |
| View farmer directory | ❌ | ✅ | ✅ | ✅ |
| Verify uploaded documents | ❌ | ❌ | ✅ | ✅ |
| Admin analytics/settings | ❌ | ❌ | ❌ | ✅ |
| Expert advisory review | ❌ | ❌ | ✅ | ✅ |

## Upload security recommendations

Current protection:
- type whitelist
- file size limit

Recommended additions:
- antivirus scanning (ClamAV or managed scanning service)
- storage outside local disk in production
- signed download URLs
- content disarm / metadata stripping for risky formats

## CSP hardening roadmap

Recommended production CSP direction:
- default self
- strict script-src
- explicit image/font/connect sources
- no unsafe-inline unless refactored away

Because some current UI components still rely on inline style patterns, CSP must be introduced carefully and validated end-to-end.

## Secret rotation policy

- rotate keys immediately if ever exposed in source history
- use separate dev/staging/prod credentials
- store backend secrets only in deployment platform secret stores
- review secrets quarterly or after every incident

## Security operations runbook

### Required GitHub settings
- enable secret scanning, push protection, and Dependabot alerts
- restrict GitHub Actions to approved actions only
- require code review for all production branches

### Key rotation steps
1. invalidate and rotate Supabase service keys, JWT secrets, and provider API keys
2. update secrets in cloud secret manager (never commit to git)
3. redeploy frontend + backend with new secret versions
4. rotate any webhook signing secrets
5. verify access logs for unexpected usage during rotation

### Immediate rotation trigger
- if any secret is pasted into AI chat, issue comments, logs, or screenshots, treat it as compromised immediately
- rotate the leaked credential at once and update all environments (`local/staging/production`) independently
- document incident timestamp, impacted services, and completion of rotation in the security log

### Token/session revocation
- rotate JWT signing keys and invalidate existing sessions on critical incidents
- revoke Supabase refresh tokens for compromised users
- expire user sessions in backend persistence when high-risk actions are detected

### Incident response
- trigger on-call alert for auth bypass, data exfiltration, or privilege escalation
- freeze high-risk endpoints using feature flags or rate limiting overrides
- capture forensic logs and preserve audit entries

## Sensitive data policy

- do not persist Aadhaar unless legally and operationally necessary
- if future storage is unavoidable, encrypt at rest, tokenize/mask in UI, and log access for audit
