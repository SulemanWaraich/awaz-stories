import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Apply persisted theme before render to prevent FOUC.
// App is dark by default; only switch to light if explicitly stored.
(() => {
  const stored = localStorage.getItem("awaz-theme");
  const root = document.documentElement;
  if (stored === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
  }
})();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </ErrorBoundary>
);

// Service worker registration — guarded against Lovable preview iframe
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();
const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com") ||
  window.location.hostname.includes("lovable.app") && window.location.hostname.includes("id-preview--");

if (isInIframe || isPreviewHost) {
  // Clear any stale SWs in preview/iframe contexts
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
  }
} else if ("serviceWorker" in navigator && import.meta.env.PROD) {
  import("workbox-window").then(({ Workbox }) => {
    const wb = new Workbox("/sw.js");
    wb.register().catch((e) => console.warn("SW registration failed", e));
  });
}
