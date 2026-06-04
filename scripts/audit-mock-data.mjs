#!/usr/bin/env node
/**
 * Mock-data audit: scans the frontend for forbidden patterns that indicate
 * hardcoded or mock market / analytics / notification data and fails CI when
 * any are found. Real data must come from Supabase or edge functions.
 *
 * Allowlist: src/data/** (curated reference datasets), tests, scripts.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
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

const ALLOW = [
  /\/src\/data\//,
  /\.test\.tsx?$/,
  /\.spec\.tsx?$/,
  /\/src\/test\//,
  /\/scripts\//,
  /\/types\//,
];

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

const violations = [];
for (const file of walk(SRC)) {
  if (!VALID_EXT.test(file)) continue;
  const rel = "/" + relative(ROOT, file).replace(/\\/g, "/");
  if (ALLOW.some((r) => r.test(rel))) continue;
  const src = readFileSync(file, "utf8");
  for (const { pattern, label } of FORBIDDEN) {
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(src))) {
      const line = src.slice(0, m.index).split("\n").length;
      violations.push({ file: rel, line, label, snippet: m[0] });
    }
  }
}

if (violations.length === 0) {
  console.log("✓ mock-data audit passed: no forbidden patterns found in src/");
  process.exit(0);
}

console.error(`✗ mock-data audit failed: ${violations.length} violation(s)\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  [${v.label}]  ${v.snippet}`);
}
console.error("\nRemove mock/hardcoded data and use Supabase or edge functions instead.");
console.error("Curated datasets are allowed only under src/data/**.");
process.exit(1);
