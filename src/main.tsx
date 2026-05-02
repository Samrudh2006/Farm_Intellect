import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { startOfflineSync } from "@/lib/offlineSync";

// Apply saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  document.documentElement.classList.add("dark");
}

if ("serviceWorker" in navigator) {
 	window.addEventListener("load", () => {
 		navigator.serviceWorker.register("/sw.js").catch((error) => {
 			console.error("Service worker registration failed:", error);
 		});
 	});
}

startOfflineSync();

createRoot(document.getElementById("root")!).render(<App />);
