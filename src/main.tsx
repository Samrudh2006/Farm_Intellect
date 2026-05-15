import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import App from "./App.tsx";
import "./index.css";
import { startOfflineSync } from "@/lib/offlineSync";

// Initialize Sentry for error tracking and performance monitoring
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          window.history as any
        ),
      }),
    ],
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      // Filter out 404 errors
      if (event.exception?.values?.[0]?.value?.includes('404')) return null;
      // Filter out CORS errors
      if (event.exception?.values?.[0]?.value?.includes('CORS')) return null;
      return event;
    },
  });
}

console.log("[v0] Application starting...");

// Apply saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  document.documentElement.classList.add("dark");
}

// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("[v0] Service worker registration failed:", error);
    });
  });
}

// Start offline sync
try {
  startOfflineSync();
  console.log("[v0] Offline sync started");
} catch (err) {
  console.error("[v0] Offline sync failed:", err);
}

// Get root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("[v0] Root element not found! Cannot mount React app");
  throw new Error("Root element with id 'root' not found in index.html");
}

// Render app
try {
  createRoot(rootElement).render(
    <Sentry.ErrorBoundary fallback={({ error, resetError }) => (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Application Error</h1>
        <p>An error occurred: {error?.message}</p>
        <button onClick={resetError}>Try again</button>
      </div>
    )} showDialog>
      <App />
    </Sentry.ErrorBoundary>
  );
  console.log("[v0] React app rendered successfully");
} catch (err) {
  console.error("[v0] Failed to render React app:", err);
  Sentry.captureException(err);
  rootElement.innerHTML = '<div style="padding: 20px; color: red;"><h1>Application Error</h1><p>Failed to load the application. Please refresh the page or clear your browser cache.</p></div>';
}

