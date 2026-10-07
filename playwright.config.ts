import { defineConfig, devices } from "@playwright/test";

// En la nube Chromium viene preinstalado (CHROMIUM_PATH); localmente Playwright usa el suyo.
const launchOptions = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:4321", launchOptions },
  webServer: { command: "npx astro preview --port 4321", url: "http://localhost:4321", reuseExistingServer: true },
  projects: [
    { name: "movil", use: { ...devices["Pixel 7"], launchOptions } },
    { name: "desktop", use: { viewport: { width: 1920, height: 1080 }, launchOptions } },
  ],
});
