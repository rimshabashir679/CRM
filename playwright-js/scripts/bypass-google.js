/**
 * One-time Google SSO bypass → land on CRM login page afterward.
 *
 *   npm run bypass:google
 *
 * 1. Chrome opens (Google SSO may appear — that is expected)
 * 2. YOU complete Google login in the browser window
 * 3. When the CRM login form appears (email + password), press Enter here
 *    (or the script auto-detects and saves)
 */
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const config = require('../Configurations/config');

const APP_URL =
  process.env.APP_URL || 'https://neo.staging.profolio.ae/sales-companion';

function askEnter(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

async function looksLikeCrmLogin(page) {
  const url = page.url();
  if (/accounts\.google\.com|cloudflareaccess\.com/i.test(url)) {
    return false;
  }
  if (!/profolio\.ae/i.test(url)) {
    return false;
  }
  const password = page.locator(
    'input[type="password"]:not([aria-hidden="true"])'
  );
  const email = page.locator(
    'input[type="email"], input[type="text"], input[name*="email" i]'
  );
  try {
    return (await password.count()) > 0 && (await email.count()) > 0;
  } catch {
    return false;
  }
}

async function main() {
  const authDir = path.resolve(__dirname, '..', 'auth');
  const profileDir = path.join(authDir, 'chrome-profile');
  const storageFile = path.join(authDir, 'user.json');
  fs.mkdirSync(profileDir, { recursive: true });

  console.log('\n=============================================');
  console.log(' Bypass Google SSO → CRM login page');
  console.log('=============================================');
  console.log('Google will likely open first — that is normal.');
  console.log('');
  console.log('In the Chrome window:');
  console.log('  1. Sign in with your @dubizzlegroup.com Google account');
  console.log('  2. Wait until you see the CRM login form');
  console.log('     (email + password on neo.staging.profolio.ae)');
  console.log('  3. Do NOT click Sign in on the CRM form');
  console.log('  4. Come back here and press Enter\n');

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
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' }).catch(() => {});

  console.log('Current URL:', page.url());
  console.log('\n>>> Complete Google login in Chrome, then press Enter here <<<\n');

  // Poll in background and print status; user can press Enter anytime
  let stopPoll = false;
  const poll = (async () => {
    while (!stopPoll) {
      const url = page.url();
      const ok = await looksLikeCrmLogin(page);
      if (ok) {
        console.log('\n✓ CRM login form detected at:', url);
        console.log('  Press Enter to save (or wait a moment)...\n');
        return true;
      }
      process.stdout.write(
        `\rStill waiting... ${url.slice(0, 80).replace(/\n/g, '')}   `
      );
      await page.waitForTimeout(2000);
    }
    return false;
  })();

  await Promise.race([
    poll,
    askEnter('Press Enter after CRM login form is visible... '),
  ]);
  stopPoll = true;

  // Small settle time
  await page.waitForTimeout(1000);

  const url = page.url();
  console.log('\nFinal URL:', url);

  if (/accounts\.google\.com/i.test(url)) {
    console.error(
      '\nStill on Google SSO. You must finish Google login in the Chrome window first.\n' +
        'Run again:  npm run bypass:google\n'
    );
    await context.close();
    process.exit(1);
  }

  if (!/profolio\.ae/i.test(url)) {
    console.error(
      '\nNot on the CRM site yet. Finish login until you see neo.staging.profolio.ae,\n' +
        'then run:  npm run bypass:google\n'
    );
    await context.close();
    process.exit(1);
  }

  await context.storageState({ path: storageFile });
  console.log(`\n✓ Saved session → ${storageFile}`);
  console.log(`✓ Chrome profile → ${profileDir}`);
  console.log('\nGoogle bypassed. Run tests (should open CRM login, not Google):');
  console.log('  npm run test:headed');
  console.log('  npm run test:login\n');

  await context.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
