#!/usr/bin/env node
/**
 * Mock-data audit: scans the frontend for forbidden patterns that indicate
 * hardcoded or mock market / analytics / notification data. Prints a clean
 * per-file report and exits 1 only when unsafe patterns are detected.
 *
 * Per-file opt-out: include the comment `audit-allow: mock-data` in a file.
 * Global allowlist: list path globs in `.mockdata-allowlist` (one per line,
 *   `#` comments supported). Matched files are skipped entirely.
 * Built-in allowlist: src/data/**, tests, scripts, types.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const FORBIDDEN = [
  { pattern: /Math\.random\s*\(/g, label: "Math.random()" },
  { pattern: /\bfaker\./g, label: "faker.*" },
  { pattern: /lorem ipsum/gi, label: "lorem ipsum" },
  { pattern: /\b(mockPrices|fakePrices|dummyPrices|hardcodedPrices)\b/g, label: "mock price variable" },
  { pattern: /\b(mockNotifications|fakeNotifications|dummyNotifications)\b/g, label: "mock notification variable" },
  { pattern: /\b(mockAnalytics|fakeAnalytics|dummyAnalytics)\b/g, label: "mock analytics variable" },
  { pattern: /TODO:\s*replace with real data/gi, label: "TODO real-data placeholder" },
];

const BUILTIN_ALLOW = [
  /\/src\/data\//,
  /\.test\.tsx?$/,
  /\.spec\.tsx?$/,
  /\/src\/test\//,
  /\/scripts\//,
  /\/types\//,
];

function loadUserAllowlist() {
  const file = join(ROOT, ".mockdata-allowlist");
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((glob) => new RegExp(glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")));
}

const USER_ALLOW = loadUserAllowlist();
const VALID_EXT = /\.(ts|tsx|js|jsx)$/;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const perFile = new Map();
let totalFilesScanned = 0;
let totalFilesSkipped = 0;

for (const file of walk(SRC)) {
  if (!VALID_EXT.test(file)) continue;
  const rel = "/" + relative(ROOT, file).replace(/\\/g, "/");
  if (BUILTIN_ALLOW.some((r) => r.test(rel)) || USER_ALLOW.some((r) => r.test(rel))) {
    totalFilesSkipped += 1;
    continue;
  }
  totalFilesScanned += 1;
  const src = readFileSync(file, "utf8");
  if (/audit-allow:\s*mock-data/i.test(src)) { totalFilesSkipped += 1; continue; }
  for (const { pattern, label } of FORBIDDEN) {
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(src))) {
      const line = src.slice(0, m.index).split("\n").length;
      if (!perFile.has(rel)) perFile.set(rel, []);
      perFile.get(rel).push({ line, label, snippet: m[0] });
    }
  }
}

const violationCount = [...perFile.values()].reduce((n, v) => n + v.length, 0);

console.log("── mock-data audit ──");
console.log(`scanned: ${totalFilesScanned} files  •  skipped (allowlisted): ${totalFilesSkipped}`);

if (violationCount === 0) {
  console.log("✓ passed: no forbidden patterns found");
  process.exit(0);
}

console.error(`\n✗ failed: ${violationCount} violation(s) across ${perFile.size} file(s)\n`);
for (const [file, hits] of perFile) {
  console.error(`  ${file}  (${hits.length})`);
  for (const h of hits) {
    console.error(`    L${h.line}  [${h.label}]  ${h.snippet}`);
  }
  console.error("");
}
console.error("Remove mock/hardcoded data and use Supabase or edge functions instead.");
console.error("Curated datasets are allowed only under src/data/**.");
console.error("To allowlist a path, add a glob to .mockdata-allowlist, or add the comment");
console.error("  // audit-allow: mock-data");
console.error("at the top of the file (only when the pattern is unrelated to data).");
process.exit(1);
