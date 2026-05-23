import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
  },
  plugins: [
    react(),
    {
      name: "robots-policy-meta",
      transformIndexHtml(html) {
        if (!html.includes("%ROBOTS_POLICY%")) {
          throw new Error("Missing %ROBOTS_POLICY% placeholder in index.html.");
        }
        return html.replace(/%ROBOTS_POLICY%/g, robotsPolicy);
      },
    },
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
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
