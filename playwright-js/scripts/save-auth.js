/**
 * Interactive helper: open a headed browser, let you complete Google SSO once,
 * then save Playwright storage state to auth/user.json for later headless runs.
 *
 * Usage:
 *   node scripts/save-auth.js
 */
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const config = require('../Configurations/config');

(async () => {
  const authDir = path.resolve(__dirname, '..', 'auth');
  fs.mkdirSync(authDir, { recursive: true });
  const outFile = path.join(authDir, 'user.json');

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const context = await browser.newContext({
    extraHTTPHeaders: {
      'CF-Access-Client-Id': config.cfAccessClientId,
      'CF-Access-Client-Secret': config.cfAccessClientSecret,
    },
  });
  const page = await context.newPage();
  await page.goto(config.baseURL, { waitUntil: 'domcontentloaded' });

  console.log('\nComplete Google SSO / CRM login in the opened browser.');
  console.log('When you land on the CRM app, return here and press Enter.\n');

  await new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once('data', resolve);
  });

  await context.storageState({ path: outFile });
  console.log(`Saved auth state → ${outFile}`);
  console.log('Re-run tests with: STORAGE_STATE=auth/user.json npm test\n');
  await browser.close();
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
