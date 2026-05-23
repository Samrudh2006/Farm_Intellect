# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| Current default branch | ✅ |
| Older snapshots | ❌ |

## Reporting vulnerabilities

Do **not** open public issues for vulnerabilities.

Report privately via:
- GitHub Security Advisories (preferred)
- security@farmintellect.app

Please include impact, reproduction steps, and suggested remediation if available.

## Security baseline

- Browser bundles must not include provider secrets.
- `VITE_*` variables are treated as public values.
- AI/weather/provider credentials are backend-only (`backend/.env` or server-side secrets).
- Authentication and profile management use Supabase auth + role checks.
- API routes enforce authz/authn and rate limits.

## Scope highlights

In scope:
- auth bypass / privilege escalation
- API key leakage / sensitive data exposure
- RLS or authorization bypass
- XSS/CSRF/injection issues

Out of scope:
- social engineering
- issues in third-party services without exploitable integration bugs here

## Disclosure process

1. Acknowledge within 48 hours.
2. Triage and severity assessment.
3. Patch and deploy fix.
4. Public disclosure after remediation.
