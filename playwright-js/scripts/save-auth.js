/**
 * Bypass Google SSO for later test runs:
 * 1) Opens a real Chrome window
 * 2) You log in manually (Google + CRM)
 * 3) Saves cookies/session to auth/user.json
 *
 * Usage:
 *   npm run auth:save
 *
 * Then run tests (they will skip Google automatically):
 *   npm run test:bypass
 */
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const config = require('../Configurations/config');

(async () => {
  const authDir = path.resolve(__dirname, '..', 'auth');
  fs.mkdirSync(authDir, { recursive: true });
  const outFile = path.join(authDir, 'user.json');

  // Prefer installed Google Chrome — Google SSO accepts it more reliably
  let browser;
  try {
    browser = await chromium.launch({
      headless: false,
      channel: 'chrome',
      args: ['--disable-blink-features=AutomationControlled'],
    });
  } catch {
    browser = await chromium.launch({
      headless: false,
      args: ['--disable-blink-features=AutomationControlled'],
    });
  }

  const context = await browser.newContext({
    extraHTTPHeaders: {
      'CF-Access-Client-Id': config.cfAccessClientId,
      'CF-Access-Client-Secret': config.cfAccessClientSecret,
    },
  });
  const page = await context.newPage();

  // Land on app root (same as Python conftest), not /login
  const appUrl = config.baseURL.replace(/\/login\/?$/, '');
  await page.goto(appUrl, { waitUntil: 'domcontentloaded' });

  console.log('\n========================================');
  console.log(' BYPASS SETUP — log in once manually');
  console.log('========================================');
  console.log('1. Complete Google SSO in the browser window');
  console.log('2. Wait until you see the CRM / Sales Companion app');
  console.log('3. Come back here and press Enter to save the session\n');

  await new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once('data', resolve);
  });

  // Prefer saving once we are back on the CRM domain
  const url = page.url();
  if (!/profolio\.ae/i.test(url)) {
    console.warn(
      `\nWarning: current URL is still:\n  ${url}\n` +
        'Session may not include CRM cookies. Prefer saving after the CRM loads.\n'
    );
  }

  await context.storageState({ path: outFile });
  console.log(`\nSaved session → ${outFile}`);
  console.log('Google will be bypassed on the next runs.\n');
  console.log('Run tests with:');
  console.log('  npm run test:bypass');
  console.log('  npm run test:bypass:headed\n');

  await browser.close();
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
