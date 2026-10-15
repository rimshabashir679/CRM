const { test, expect } = require('@playwright/test');
const { setup } = require('../utils/setup');
const logger = require('../utils/logger');

/**
 * Verifies conftest-style CDP CF-Access headers land on CRM login
 * (not Google SSO).
 */
test.describe('Smoke — CF Access bypass (conftest.py style)', () => {
  test('sales-companion opens CRM login instead of Google SSO', async ({
    page,
    context,
  }) => {
    logger.info('********* Smoke: CDP CF-Access setup (like conftest.py) *********');
    await setup(page, context);

    const url = page.url();
    logger.info(`Landed on: ${url}`);

    expect(url).not.toMatch(/accounts\.google\.com/i);
    expect(url).toMatch(/profolio\.ae/i);

    // Native CRM login fields should be present (same as Selenium LoginPage)
    const email = page
      .locator(
        'input[type="email"], input[type="text"], input[name*="email" i]'
      )
      .first();
    const password = page.locator('input[type="password"]').first();

    await expect(email).toBeVisible({ timeout: 20_000 });
    await expect(password).toBeVisible({ timeout: 20_000 });

    logger.info('********* Smoke: CRM login page loaded (Google SSO bypassed) *********');
  });
});
