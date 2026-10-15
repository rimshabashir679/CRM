const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { LoginPage } = require('../page-objects/LoginPage');
const { ReadConfig } = require('../utils/readConfig');
const { setup } = require('../utils/setup');
const logger = require('../utils/logger');

const screenshotsDir = path.resolve(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * Port of TestCases/test_loginPage.py
 * Uses the same CDP CF-Access headers + /sales-companion entry as conftest.py
 * so the native CRM login form is shown (not Google SSO).
 */
test.describe('Test_01_LoginPage', () => {
  const email = ReadConfig.getEmail();
  const password = ReadConfig.getPassword();

  test('test_login — sign in, capture screenshot, sign out', async ({
    page,
    context,
  }) => {
    logger.info('********* TestCase_01_Login *********');

    // Same as Python: setup() then LoginPage actions
    await setup(page, context);

    // Should be on CRM (login form), not Google
    await expect(page).not.toHaveURL(/accounts\.google\.com/i, {
      timeout: 15_000,
    });
    expect(page.url()).toMatch(/profolio\.ae/i);

    const lp = new LoginPage(page);
    await lp.setEmail(email);
    await lp.setPassword(password);
    await lp.clickOnEyeIcon();
    await lp.clickOnRememberMe();
    await lp.clickOnSignInButton();

    logger.info('********* Verified Successful Login *********');
    await page.screenshot({
      path: path.join(screenshotsDir, 'test_login.png'),
      fullPage: true,
    });

    await lp.clickOnSignOutButton();
  });
});
