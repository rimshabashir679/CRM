// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const config = require('./Configurations/config');

const storageStatePath = process.env.STORAGE_STATE
  ? path.resolve(__dirname, process.env.STORAGE_STATE)
  : path.resolve(__dirname, 'auth', 'user.json');

const useStorageState = fs.existsSync(storageStatePath);

/**
 * Playwright config mirroring the Selenium Python CRM project.
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
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
    baseURL: config.baseURL.replace(/\/login\/?$/, ''),
    headless: process.env.HEADED === 'true' ? false : true,
    viewport: { width: 1366, height: 768 },
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    ...(useStorageState ? { storageState: storageStatePath } : {}),
    extraHTTPHeaders: {
      'CF-Access-Client-Id': config.cfAccessClientId,
      'CF-Access-Client-Secret': config.cfAccessClientSecret,
    },
    launchOptions: {
      args: ['--disable-blink-features=AutomationControlled'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'test-results',
});
