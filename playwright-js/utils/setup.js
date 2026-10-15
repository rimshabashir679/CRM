const fs = require('fs');
const path = require('path');
const config = require('../Configurations/config');
const { getStorageStatePath, hasSavedSession } = require('./auth');

const CF_HEADERS = {
  'CF-Access-Client-Id': config.cfAccessClientId,
  'CF-Access-Client-Secret': config.cfAccessClientSecret,
};

const APP_URL =
  process.env.APP_URL || 'https://neo.staging.profolio.ae/sales-companion';

/**
 * Playwright port of TestCases/conftest.py → setup()
 *
 * 1) If auth/user.json exists → reuse it (skips Google)
 * 2) Else apply CF Access headers (CDP + route + context) like Selenium
 *
 * @param {import('@playwright/test').Browser} browser
 */
async function setup(browser) {
  const storageState = hasSavedSession() ? getStorageStatePath() : undefined;
  if (storageState) {
    console.log(`[setup] Using saved session → ${storageState}`);
  }

  const context = await browser.newContext({
    extraHTTPHeaders: CF_HEADERS,
    viewport: null,
    ...(storageState ? { storageState } : {}),
  });

  // Force CF headers on every request (Playwright can ignore CDP-only headers)
  await context.route('**/*', async (route) => {
    const headers = {
      ...route.request().headers(),
      ...CF_HEADERS,
    };
    await route.continue({ headers });
  });

  const page = await context.newPage();

  // Same CDP calls as Selenium conftest.py
  try {
    const client = await context.newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.setExtraHTTPHeaders', { headers: CF_HEADERS });
  } catch (err) {
    console.warn('[setup] CDP headers skipped:', err.message);
  }

  const response = await page.goto(APP_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 45_000,
  });

  console.log(
    `[setup] status=${response ? response.status() : 'n/a'} url=${page.url()}`
  );

  if (/accounts\.google\.com/i.test(page.url())) {
    console.warn(
      '\n[setup] Landed on Google SSO — CF Access service token was NOT accepted.\n' +
        '        The tokens in conftest.py currently return service_token_status=false.\n' +
        '        Bypass:  npm run auth:save   then   npm run test:bypass\n'
    );
  }

  return { context, page };
}

module.exports = { setup, CF_HEADERS, APP_URL };
