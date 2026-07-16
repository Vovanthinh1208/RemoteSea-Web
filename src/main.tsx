import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { initMonitoring } from "@/services/monitoring";
import { initAnalytics } from "@/services/analytics";
// Self-hosted fonts (were a render-blocking Google Fonts stylesheet — two
// third-party origins on the critical path). Same families and weights the
// old <link> loaded; @fontsource ships font-display: swap by default.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@/styles/globals.css";

initMonitoring();
initAnalytics();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
