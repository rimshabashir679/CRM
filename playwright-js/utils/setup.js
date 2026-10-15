const config = require('../Configurations/config');

/**
 * Playwright equivalent of TestCases/conftest.py → setup()
 *
 * Selenium does:
 *   driver.execute_cdp_cmd("Network.enable", {})
 *   driver.execute_cdp_cmd("Network.setExtraHTTPHeaders", { headers })
 *   driver.get("https://neo.staging.profolio.ae/sales-companion")
 *
 * Same flow here via CDP so Cloudflare Access service-token headers
 * land you on the CRM login page instead of Google SSO.
 *
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').BrowserContext} context
 * @returns {Promise<import('@playwright/test').Page>}
 */
async function setup(page, context) {
  const headers = {
    'CF-Access-Client-Id': config.cfAccessClientId,
    'CF-Access-Client-Secret': config.cfAccessClientSecret,
  };

  // Mirror Selenium CDP injection
  const client = await context.newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.setExtraHTTPHeaders', { headers });

  // Same URL as conftest.py (NOT /login)
  const appUrl =
    process.env.APP_URL ||
    'https://neo.staging.profolio.ae/sales-companion';

  await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
  return page;
}

module.exports = { setup };
