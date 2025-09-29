import { defineConfig, devices } from '@playwright/test';
require('dotenv').config();

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [
    ['./tests/support/reporters/custom-reporter.ts'],
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: 'never',
        attachments: 'on',
      },
    ],
    [
      'json',
      {
        outputFile: 'test-results/results.json',
      },
    ],
    [
      'junit',
      {
        outputFile: 'test-results/junit.xml',
      },
    ],
    [
      'blob',
      {
        outputFile: 'test-results/blob-report.zip',
      },
    ],
  ],
  use: {
    trace: 'retain-on-failure',
    headless: true,
    baseURL: process.env.BASE_URL,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    // Testes de interface (E2E)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Testes de API
    {
      name: 'api',
      testMatch: /api\/.*\.(spec|test)\.ts$/i,
      use: { baseURL: process.env.BASE_URL },
    },
  ],
});
