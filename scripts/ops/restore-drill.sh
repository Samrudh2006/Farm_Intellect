#!/usr/bin/env bash
set -euo pipefail
# Configure: DRILL_DATABASE_URL, BACKUP_FILE
: "${DRILL_DATABASE_URL:?DRILL_DATABASE_URL is required}"
: "${BACKUP_FILE:?BACKUP_FILE is required}"
gunzip -c "$BACKUP_FILE" | psql "$DRILL_DATABASE_URL"
echo "Restore drill complete: $BACKUP_FILE -> $DRILL_DATABASE_URL"
