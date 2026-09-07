import { defineConfig, devices } from "@playwright/test";

const CI = !!process.env.CI;
const baseURL = process.env.BASE_URL ?? "http://localhost:5173";

export default defineConfig({
  testDir: "./app",
  // Explicit: the defaults resolve against the repo root's package.json, and
  // the Docker volumes and .gitignore point here.
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI
    ? [
        ["html", { open: "never", outputFolder: "./playwright-report" }],
        ["github"],
      ]
    : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Must match the zone the seeds are computed in (global.setup.ts).
    locale: "es-ES",
    timezoneId: "Europe/Madrid",
  },
  projects: [
    {
      name: "mobile",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 360, height: 800 },
        deviceScaleFactor: 2,
      },
    },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "pnpm dev --port 5173 --strictPort",
    url: baseURL,
    cwd: "..",
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
});
