import { defineConfig, devices } from '@playwright/test'

const browserChannel = process.env.PLAYWRIGHT_CHANNEL || (process.env.CI ? undefined : 'chrome')
const browserSelection = browserChannel ? { channel: browserChannel } : {}

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  timeout: 20_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-chromium',
      testMatch: /smoke\.spec\.ts/,
      use: {
        browserName: 'chromium',
        ...browserSelection,
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile-chromium',
      testMatch: /smoke\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
        browserName: 'chromium',
        ...browserSelection,
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'iphone-webkit',
      testMatch: /ios-hero-scroll\.spec\.ts/,
      use: {
        ...devices['iPhone 13'],
        browserName: 'webkit',
      },
    },
  ],
})
