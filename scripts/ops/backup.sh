#!/usr/bin/env bash
set -euo pipefail
# Configure: DATABASE_URL, BACKUP_TARGET_URI
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_TARGET_URI:?BACKUP_TARGET_URI is required}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="backup-${STAMP}.sql.gz"
pg_dump "$DATABASE_URL" | gzip > "$OUT"
# Example: aws s3 cp "$OUT" "$BACKUP_TARGET_URI/$OUT"
echo "Created $OUT (upload command depends on provider)"
