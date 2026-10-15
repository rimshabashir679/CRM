// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const config = require('./Configurations/config');

/**
 * CF Access headers are applied in utils/setup.js (context + route + CDP),
 * matching TestCases/conftest.py order. Prefer real Chrome like Selenium.
 */
module.exports = defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.js/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: config.appURL,
    headless: process.env.HEADED === 'true' ? false : true,
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      'CF-Access-Client-Id': config.cfAccessClientId,
      'CF-Access-Client-Secret': config.cfAccessClientSecret,
    },
    launchOptions: {
      args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    },
  },
  projects: [
    {
      // Prefer real Chrome (like Selenium). Override with: PW_CHANNEL=chromium npm test
      name: process.env.PW_CHANNEL === 'chromium' ? 'chromium' : 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env.PW_CHANNEL === 'chromium'
          ? {}
          : { channel: 'chrome' }),
      },
    },
  ],
  outputDir: 'test-results',
});
