import { defineConfig } from "@playwright/test";
export default defineConfig({
  timeout: 90000,
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3100",
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  webServer: {
    command:
      process.env.PLAYWRIGHT_PRODUCTION === "true"
        ? "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3100"
        : "node node_modules/next/dist/bin/next dev --webpack --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/api/health",
    reuseExistingServer: false,
    timeout: 120000,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { viewport: { width: 360, height: 800 } } },
  ],
});
