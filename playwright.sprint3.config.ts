import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./qa",
  testMatch: "sprint3.browser.ts",
  workers: 1,
  timeout: 30000,
  reporter: [
    ["list"],
    ["json", { outputFile: "../docs/sprint3-evidence/browser-results.json" }],
  ],
  outputDir: "../docs/sprint3-evidence/browser-artifacts",
  use: {
    baseURL: "http://127.0.0.1:4313",
    channel: "chrome",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4313 --strictPort",
    url: "http://127.0.0.1:4313/qa/sprint3-browser.html",
    reuseExistingServer: false,
    timeout: 60000,
    env: { VITE_API_URL: "http://127.0.0.1:4103", VITE_SPRINT_FOCUS: "all" },
  },
});
