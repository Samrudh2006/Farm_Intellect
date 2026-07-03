import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

// Vercel parity: prefer VITE_* env vars (what the client actually reads),
// fall back to Vercel/Next-style names. Only inject via `define` when we
// actually have a value — otherwise Vite's own import.meta.env from .env
// wins at build time.
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const SUPABASE_PROJECT_ID =
  process.env.VITE_SUPABASE_PROJECT_ID ||
  process.env.SUPABASE_PROJECT_ID ||
  '';

const vendorChunkGroups: Array<[string, string[]]> = [
  ["react-vendor", ["react", "react-dom"]],
  ["router-vendor", ["react-router-dom", "@tanstack/react-query"]],
  ["supabase-vendor", ["@supabase"]],
  ["ui-vendor", ["@radix-ui", "class-variance-authority", "clsx", "tailwind-merge", "lucide-react"]],
  ["charts-vendor", ["recharts"]],
  ["motion-vendor", ["framer-motion"]],
  ["date-vendor", ["date-fns"]],
  ["fabric-vendor", ["fabric"]],
  ["markdown-vendor", ["react-markdown"]],
];

// Safe default for local/preview builds; set VITE_ROBOTS_POLICY="index, follow" for production indexing.
const robotsPolicy = process.env.VITE_ROBOTS_POLICY || "noindex, nofollow";

const basePath = (() => {
  const value = process.env.VITE_BASE_PATH?.trim();

  if (!value) {
    return "/";
  }

  const normalized = value.startsWith("/") ? value : `/${value}`;
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
})();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: basePath,
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(SUPABASE_ANON_KEY),
  },
  server: {
    host: "::",
    port: 4000,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "node_modules/",
        "src/test/",
        "src/main.tsx",
        "**/*.d.ts",
        "**/index.ts",
      ],
      lines: 50,
      functions: 50,
      branches: 40,
      statements: 50,
    },
  },
  plugins: [
    react(),
    {
      name: "robots-policy-meta",
      transformIndexHtml(html: string) {
        if (!html.includes("%ROBOTS_POLICY%")) {
          throw new Error("Missing %ROBOTS_POLICY% placeholder in index.html.");
        }
        return html.replace(/%ROBOTS_POLICY%/g, robotsPolicy);
      },
    },
    mode === "development" && componentTagger(),
    visualizer({
      filename: "dist/stats.html",
      title: "Bundle Analysis",
      open: false,
      gzipSize: true,
      brotliSize: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2018",
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    modulePreload: { polyfill: false },
    chunkSizeWarningLimit: 450,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          const matchedGroup = vendorChunkGroups.find(([, packages]) =>
            packages.some((pkg) => id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`)),
          );

          if (matchedGroup) {
            return matchedGroup[0];
          }

          return undefined;
        },
      },
    },
  },
}));
