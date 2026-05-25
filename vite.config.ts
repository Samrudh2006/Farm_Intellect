import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

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
      transformIndexHtml(html) {
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
    // Target 2G network speeds (~50-100 Kbps)
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        passes: 2, // Multiple passes for better compression
      },
      mangle: {
        toplevel: true,
      },
    },
    chunkSizeWarningLimit: 500, // Warn at 500kb
    rollupOptions: {
      output: {
        // Aggressive code splitting for 2G
        manualChunks: {
          // Vendor chunks (already defined above will be used)
          ...Object.fromEntries(vendorChunkGroups.map(([name]) => [name, []])),
          // Lazy load heavy components
          'satellite-viewer': ['src/components/satellite/NDVIViewer.tsx'],
          'field-drawer': ['src/components/field/MobileFieldDrawer.tsx'],
          'soil-management': ['src/components/soil/SoilHealthPage.tsx'],
        },
        // Optimize chunk naming for caching
        chunkFileNames: 'chunks/[name]-[hash:8].js',
        entryFileNames: '[name]-[hash:8].js',
        // Inline small chunks to reduce HTTP requests
        inlineDynamicImports: false,
      },
    },
  },
}));
