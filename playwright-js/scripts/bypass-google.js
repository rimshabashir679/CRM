/**
 * One-time Google SSO bypass → land on CRM login page afterward.
 *
 * How it works:
 *  1. Opens Chrome
 *  2. You complete Google / Cloudflare Access login manually
 *  3. Script waits until the CRM login form is visible
 *     (email + password fields — NOT Google)
 *  4. Saves cookies to auth/user.json
 *
 * Later: npm test / npm run test:headed will skip Google and open the CRM login page.
 *
 * Usage:
 *   npm run bypass:google
 */
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const config = require('../Configurations/config');

const APP_URL =
  process.env.APP_URL || 'https://neo.staging.profolio.ae/sales-companion';

async function main() {
  const authDir = path.resolve(__dirname, '..', 'auth');
  const profileDir = path.join(authDir, 'chrome-profile');
  const storageFile = path.join(authDir, 'user.json');
  fs.mkdirSync(profileDir, { recursive: true });

  console.log('\n=============================================');
  console.log(' Bypass Google SSO → CRM login page');
  console.log('=============================================');
  console.log('1. Chrome will open to the app');
  console.log('2. Complete Google sign-in if asked');
  console.log('3. STOP when you see the CRM login form');
  console.log('   (email + password fields on profolio.ae)');
  console.log('4. Do NOT click Sign in on the CRM form');
  console.log('5. Script auto-saves when the CRM form appears\n');

  let context;
  const launchOpts = {
    headless: false,
    args: ['--start-maximized'],
    ignoreHTTPSErrors: true,
    viewport: null,
    extraHTTPHeaders: {
      'CF-Access-Client-Id': config.cfAccessClientId,
      'CF-Access-Client-Secret': config.cfAccessClientSecret,
    },
  };

  try {
    context = await chromium.launchPersistentContext(profileDir, {
      ...launchOpts,
      channel: 'chrome',
    });
  } catch {
    context = await chromium.launchPersistentContext(profileDir, launchOpts);
  }

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });

  console.log('Waiting for CRM login form (not Google)...');
  console.log('Current URL:', page.url());

  // Wait until we are on profolio and a password field is visible
  // (CRM/Filament login), or user presses Enter as fallback
  const saved = await Promise.race([
    (async () => {
      await page.waitForFunction(
        () => {
          const onCrm = /profolio\.ae/i.test(location.href);
          const onGoogle = /accounts\.google\.com/i.test(location.href);
          if (!onCrm || onGoogle) return false;
          const pwd = document.querySelector(
            'input[type="password"]:not([aria-hidden="true"])'
          );
          const email = document.querySelector(
            'input[type="email"], input[type="text"], input[name*="email" i]'
          );
          return !!(pwd && email);
        },
        { timeout: 300_000 }
      );
      return 'auto';
    })(),
    new Promise((resolve) => {
      process.stdin.resume();
      process.stdin.once('data', () => resolve('enter'));
    }),
  ]);

  const url = page.url();
  console.log(`\nDetected ready (${saved}). URL: ${url}`);

  if (/accounts\.google\.com/i.test(url)) {
    console.error(
      '\nStill on Google. Finish Google login until the CRM login form shows, then run again.\n'
    );
    await context.close();
    process.exit(1);
  }

  await context.storageState({ path: storageFile });
  console.log(`\n✓ Saved session → ${storageFile}`);
  console.log(`✓ Chrome profile → ${profileDir}`);
  console.log('\nGoogle SSO bypassed. Next runs open the CRM login page:');
  console.log('  npm run test:headed');
  console.log('  npm run test:login\n');

  await context.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
