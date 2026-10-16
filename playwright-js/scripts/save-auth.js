/**
 * Save a Chrome session that already passed Cloudflare Access + CRM login.
 * Later tests reuse this profile / storage state and skip Google SSO.
 *
 *   npm run auth:save
 */
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const config = require('../Configurations/config');

(async () => {
  const authDir = path.resolve(__dirname, '..', 'auth');
  const profileDir = path.join(authDir, 'chrome-profile');
  const storageFile = path.join(authDir, 'user.json');
  fs.mkdirSync(profileDir, { recursive: true });

  const appUrl =
    process.env.APP_URL || 'https://neo.staging.profolio.ae/sales-companion';

  console.log('\n========================================');
  console.log(' Manual login — bypass Google for tests');
  console.log('========================================');
  console.log('1. Chrome will open');
  console.log('2. Complete Google / CF Access / CRM login yourself');
  console.log('3. When you see the CRM app, return here and press Enter\n');

  let context;
  try {
    context = await chromium.launchPersistentContext(profileDir, {
      headless: false,
      channel: 'chrome',
      args: ['--start-maximized'],
      ignoreHTTPSErrors: true,
      extraHTTPHeaders: {
        'CF-Access-Client-Id': config.cfAccessClientId,
        'CF-Access-Client-Secret': config.cfAccessClientSecret,
      },
    });
  } catch {
    context = await chromium.launchPersistentContext(profileDir, {
      headless: false,
      args: ['--start-maximized'],
      ignoreHTTPSErrors: true,
      extraHTTPHeaders: {
        'CF-Access-Client-Id': config.cfAccessClientId,
        'CF-Access-Client-Secret': config.cfAccessClientSecret,
      },
    });
  }

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(appUrl, { waitUntil: 'domcontentloaded' });

  await new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once('data', resolve);
  });

  await context.storageState({ path: storageFile });
  console.log(`\nSaved storage state → ${storageFile}`);
  console.log(`Saved Chrome profile → ${profileDir}`);
  console.log('\nRun tests with the saved session:');
  console.log('  npm run test:bypass');
  console.log('  npm run test:bypass:headed\n');

  await context.close();
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
