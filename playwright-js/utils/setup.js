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
 * Open the CRM app past Google SSO.
 *
 * Priority:
 *  1. Saved session from `npm run bypass:google` (auth/user.json)
 *  2. CF_AUTHORIZATION cookie from env (.env)
 *  3. CF Access service-token headers (same as Selenium conftest.py)
 *
 * @param {import('@playwright/test').Browser} browser
 */
async function setup(browser) {
  const storageState = hasSavedSession() ? getStorageStatePath() : undefined;
  const cfJwt = process.env.CF_AUTHORIZATION || '';

  if (storageState) {
    console.log(`[setup] Using saved session (Google bypassed) → ${storageState}`);
  } else if (cfJwt) {
    console.log('[setup] Using CF_AUTHORIZATION cookie from env');
  } else {
    console.log('[setup] Using CF Access service-token headers (conftest style)');
  }

  const context = await browser.newContext({
    extraHTTPHeaders: CF_HEADERS,
    viewport: null,
    ...(storageState ? { storageState } : {}),
  });

  // Optional: inject Cloudflare Access JWT cookie directly
  if (cfJwt && !storageState) {
    await context.addCookies([
      {
        name: 'CF_Authorization',
        value: cfJwt,
        domain: 'neo.staging.profolio.ae',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
      },
    ]);
  }

  // Force CF headers on every request
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
      '\n[setup] Still on Google SSO.\n' +
        '        CF service tokens in conftest.py are rejected by Cloudflare.\n' +
        '        Fix (one time):\n' +
        '          npm run bypass:google\n' +
        '        Then re-run your tests — you should land on the CRM login page.\n'
    );
  }

  return { context, page };
}

module.exports = { setup, CF_HEADERS, APP_URL };
