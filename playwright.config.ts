import { defineConfig, devices } from '@playwright/test';
import { environment } from './src/config/environment.js';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['blob']]
    : [
        ['html', { open: 'never' }],
        ['list'],
      ],
  use: {
    baseURL: environment.baseURL,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  expect: {
    timeout: 10_000,
  },
  webServer: {
    command: 'node test-app/server.mjs',
    url: environment.resilienceBaseURL,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'auth-setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/setup/**', '**/authenticated/**'],
    },
    {
      name: 'authenticated-chromium',
      testMatch: '**/authenticated/**/*.spec.ts',
      dependencies: ['auth-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: environment.authStatePath,
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: ['**/setup/**', '**/authenticated/**'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: ['**/setup/**', '**/authenticated/**'],
    },
  ],
});
