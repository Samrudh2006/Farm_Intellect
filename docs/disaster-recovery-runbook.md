# Disaster Recovery Runbook

- RPO target: 24h
- RTO target: 4h
- Restore steps: provision temp DB, restore latest external backup, run integrity checks, swap traffic after validation.
- Key leak response: rotate keys, revoke tokens, redeploy secrets.
