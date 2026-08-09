import { defineConfig, devices } from '@playwright/test';

/**
 * E2E auth/onboarding.
 *
 *   pnpm test:e2e
 *   pnpm --filter xi.web test:e2e:ui
 *
 * По умолчанию поднимает Vite через webServer.
 * API мокается в тестах (см. e2e/fixtures) — реальный бэкенд не нужен.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ru-RU',
  },
  webServer: {
    command: 'pnpm exec vite --host --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
