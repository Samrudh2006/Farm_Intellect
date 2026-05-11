#!/usr/bin/env bash
set -euo pipefail
# Configure: DOMAIN
: "${DOMAIN:?DOMAIN is required}"
echo "Checking SPF/DKIM/DMARC for $DOMAIN"
nslookup -type=TXT "$DOMAIN" || true
nslookup -type=TXT "_dmarc.$DOMAIN" || true
nslookup -type=TXT "selector1._domainkey.$DOMAIN" || true
