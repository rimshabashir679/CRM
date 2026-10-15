const { test, expect } = require('@playwright/test');
const { ReadConfig } = require('../utils/readConfig');
const logger = require('../utils/logger');

/**
 * Lightweight checks that do not require completing Google SSO.
 * Useful in CI and when Google blocks automated browsers.
 */
test.describe('Smoke — CRM login entry', () => {
  test('login URL is reachable and shows Google SSO or CRM form', async ({
    page,
  }) => {
    logger.info('********* Smoke: open login URL *********');
    const url = ReadConfig.getURL();
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

    expect(response, 'navigation should return a response').toBeTruthy();
    expect(response.status()).toBeLessThan(500);

    // Either redirected to Google SSO or still on the CRM login page
    const onGoogle = /accounts\.google\.com/i.test(page.url());
    const onCrm = /profolio\.ae/i.test(page.url());
    expect(onGoogle || onCrm).toBeTruthy();

    if (onGoogle) {
      await expect(page.getByText(/Sign in/i).first()).toBeVisible();
      await expect(
        page.getByRole('textbox', { name: /email/i })
      ).toBeVisible();
      logger.info('********* Smoke: Google SSO challenge visible *********');
    } else {
      logger.info('********* Smoke: CRM login page loaded *********');
    }
  });
});
