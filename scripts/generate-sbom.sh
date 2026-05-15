#!/bin/bash
# Generate Software Bill of Materials (SBOM) for compliance and security auditing
# Requires: cyclonedx-npm or similar tool

set -e

echo "[v0] Generating Software Bill of Materials (SBOM)..."

# Create build directory
mkdir -p build

# Generate SBOM in CycloneDX format (OWASP standard)
if command -v cyclonedx-npm &> /dev/null; then
  echo "[v0] Using cyclonedx-npm for SBOM generation..."
  cyclonedx-npm --output-format json --output-file build/sbom.json
  cyclonedx-npm --output-format xml --output-file build/sbom.xml
else
  echo "[v0] cyclonedx-npm not found. Installing..."
  npm install -g @cyclonedx/npm
  cyclonedx-npm --output-format json --output-file build/sbom.json
  cyclonedx-npm --output-format xml --output-file build/sbom.xml
fi

# Alternative: Generate from npm ls output
echo "[v0] Generating dependency tree..."
npm ls --depth=0 --all > build/dependencies.txt 2>&1 || true

# Generate lockfile hash for supply chain verification
echo "[v0] Generating lockfile integrity hash..."
if [ -f "package-lock.json" ]; then
  shasum -a 256 package-lock.json > build/lockfile.sha256
elif [ -f "pnpm-lock.yaml" ]; then
  shasum -a 256 pnpm-lock.yaml > build/lockfile.sha256
elif [ -f "yarn.lock" ]; then
  shasum -a 256 yarn.lock > build/lockfile.sha256
fi

echo "[v0] SBOM generated successfully!"
echo "[v0] Files created:"
echo "  - build/sbom.json (CycloneDX format)"
echo "  - build/sbom.xml (CycloneDX format)"
echo "  - build/dependencies.txt"
echo "  - build/lockfile.sha256"

echo ""
echo "[v0] Vulnerability check (npm audit)..."
npm audit --audit-level=moderate || echo "[v0] Warning: Vulnerabilities found. Review with: npm audit"
