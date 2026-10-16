/**
 * One-time Google SSO bypass → save session at CRM login page.
 *
 *   npm run bypass:google
 *
 * Uses real Chrome with automation flags removed so Google "Next" works.
 * If it still fails, use: npm run bypass:google:system
 */
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { execSync, spawn } = require('child_process');
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
  if (/accounts\.google\.com|cloudflareaccess\.com/i.test(url)) return false;
  if (!/profolio\.ae/i.test(url)) return false;
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

async function saveAndExit(context, storageFile, profileDir) {
  const pages = context.pages();
  const page = pages[0] || (await context.newPage());
  const url = page.url();
  console.log('\nFinal URL:', url);

  if (/accounts\.google\.com/i.test(url)) {
    console.error(
      '\nStill on Google. Finish sign-in until you see neo.staging.profolio.ae\n'
    );
    await context.close().catch(() => {});
    process.exit(1);
  }
  if (!/profolio\.ae/i.test(url)) {
    console.error('\nNot on CRM yet. Finish login, then press Enter again.\n');
    await context.close().catch(() => {});
    process.exit(1);
  }

  await context.storageState({ path: storageFile });
  console.log(`\n✓ Saved session → ${storageFile}`);
  if (profileDir) console.log(`✓ Chrome profile → ${profileDir}`);
  console.log('\nRun tests (should open CRM login, not Google):');
  console.log('  npm run test:headed');
  console.log('  npm run test:login\n');
  await context.close().catch(() => {});
}

async function launchPlaywrightChrome(profileDir) {
  // Critical: strip flags that break Google's Next button
  const launchOpts = {
    headless: false,
    channel: 'chrome',
    viewport: null,
    ignoreHTTPSErrors: true,
    // Remove Playwright defaults that Google blocks
    ignoreDefaultArgs: [
      '--enable-automation',
      '--no-sandbox',
      '--disable-extensions',
    ],
    args: [
      '--disable-blink-features=AutomationControlled',
      '--start-maximized',
    ],
    extraHTTPHeaders: {
      'CF-Access-Client-Id': config.cfAccessClientId,
      'CF-Access-Client-Secret': config.cfAccessClientSecret,
    },
  };

  try {
    return await chromium.launchPersistentContext(profileDir, launchOpts);
  } catch {
    // Fallback without channel
    const { channel, ...rest } = launchOpts;
    return await chromium.launchPersistentContext(profileDir, rest);
  }
}

/**
 * Open the user's real Google Chrome (not Playwright-controlled).
 * Google login works normally. Then connect via CDP and save cookies.
 */
async function launchSystemChromeAndConnect(profileDir) {
  const port = 9222;
  const chromePath =
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

  if (!fs.existsSync(chromePath)) {
    throw new Error('Google Chrome not found at ' + chromePath);
  }

  // Kill anything already on 9222 (best-effort)
  try {
    execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore' });
  } catch {
    /* ignore */
  }

  console.log('Opening your real Google Chrome (not Playwright)...');
  const child = spawn(
    chromePath,
    [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      APP_URL,
    ],
    { detached: true, stdio: 'ignore' }
  );
  child.unref();

  // Wait for CDP
  let browser;
  for (let i = 0; i < 30; i++) {
    try {
      browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  if (!browser) {
    throw new Error('Could not connect to Chrome on port 9222');
  }

  const context = browser.contexts()[0] || (await browser.newContext());
  return { browser, context };
}

async function main() {
  const mode = process.argv.includes('--system') ? 'system' : 'playwright';
  const authDir = path.resolve(__dirname, '..', 'auth');
  const profileDir = path.join(authDir, 'chrome-profile');
  const storageFile = path.join(authDir, 'user.json');
  fs.mkdirSync(profileDir, { recursive: true });

  console.log('\n=============================================');
  console.log(' Bypass Google SSO → CRM login page');
  console.log('=============================================');
  console.log('Mode:', mode === 'system' ? 'real Chrome (recommended)' : 'Playwright Chrome');
  console.log('');
  console.log('IMPORTANT for Google email field:');
  console.log('  • Domain is locked to @dubizzlegroup.com');
  console.log('  • Type ONLY your username (e.g. rimsha.bashir)');
  console.log('  • Do NOT type @dubizzlelabs.com or full email with another domain');
  console.log('');
  console.log('Steps:');
  console.log('  1. Enter username → click Next');
  console.log('  2. Enter password → continue');
  console.log('  3. Stop at CRM login form (email + password)');
  console.log('  4. Come here and press Enter\n');

  let context;
  let browser;

  if (mode === 'system') {
    const connected = await launchSystemChromeAndConnect(profileDir);
    browser = connected.browser;
    context = connected.context;
  } else {
    context = await launchPlaywrightChrome(profileDir);
    const page = context.pages()[0] || (await context.newPage());
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' }).catch(() => {});
    console.log('Current URL:', page.url());
  }

  console.log('\n>>> Finish Google login in Chrome, then press Enter <<<\n');

  let stopPoll = false;
  const page = () => context.pages()[0];

  const poll = (async () => {
    while (!stopPoll) {
      const p = page();
      if (!p) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      if (await looksLikeCrmLogin(p)) {
        console.log('\n✓ CRM login form detected:', p.url());
        return true;
      }
      try {
        process.stdout.write(`\rWaiting... ${p.url().slice(0, 70)}   `);
      } catch {
        /* ignore */
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    return false;
  })();

  await Promise.race([
    poll,
    askEnter('Press Enter after CRM login form is visible... '),
  ]);
  stopPoll = true;

  await saveAndExit(context, storageFile, profileDir);
  if (browser) await browser.close().catch(() => {});
}

main().catch((err) => {
  console.error('\nError:', err.message);
  console.error('\nTry the system Chrome mode instead:');
  console.error('  npm run bypass:google:system\n');
  process.exit(1);
});
