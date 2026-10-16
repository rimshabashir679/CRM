/**
 * Quick check: does CF Access bypass Google like Selenium conftest.py?
 *
 *   node scripts/debug-landing.js
 *   HEADED=true node scripts/debug-landing.js
 */
const { chromium } = require('@playwright/test');
const { setup } = require('../utils/setup');

(async () => {
  const headed = process.env.HEADED === 'true';
  let browser;
  try {
    // Prefer real Chrome (same engine family as Selenium ChromeDriver)
    browser = await chromium.launch({
      headless: !headed,
      channel: 'chrome',
      args: ['--start-maximized'],
    });
    console.log('Launched: Google Chrome (channel=chrome)');
  } catch {
    browser = await chromium.launch({
      headless: !headed,
      args: ['--start-maximized'],
    });
    console.log('Launched: Playwright Chromium');
  }

  const { context, page } = await setup(browser);
  console.log('\nFinal URL:', page.url());
  console.log('Title:', await page.title());

  if (/accounts\.google\.com/i.test(page.url())) {
    console.log('\nRESULT: Google SSO (CF Access token NOT accepted)');
    console.log('Next steps:');
    console.log('  1. Run your Python conftest setup() now — does it still skip Google?');
    console.log('  2. If Python works, paste any different CF tokens you use locally into playwright-js/.env');
    console.log('  3. npm run auth:save  (manual login once) then npm run test:bypass');
  } else if (/profolio\.ae/i.test(page.url())) {
    console.log('\nRESULT: CRM / Profolio page (Google bypassed) ✓');
  } else {
    console.log('\nRESULT: Unexpected URL');
  }

  if (headed) {
    console.log('\nBrowser left open 10s for inspection...');
    await page.waitForTimeout(10_000);
  }

  await context.close();
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
