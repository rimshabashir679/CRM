const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { LoginPage } = require('../page-objects/LoginPage');
const { ReadConfig } = require('../utils/readConfig');
const logger = require('../utils/logger');

const screenshotsDir = path.resolve(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * Port of TestCases/test_loginPage.py — Test_01_LoginPage
 *
 * Note: Google may block headless/cloud browsers. Prefer:
 *   npm run test:headed
 * or a saved storage state (see README).
 */
test.describe('Test_01_LoginPage', () => {
  const url = ReadConfig.getURL();
  const email = ReadConfig.getEmail();
  const password = ReadConfig.getPassword();

  test('test_login — sign in, capture screenshot, sign out', async ({
    page,
  }, testInfo) => {
    logger.info('********* TestCase_01_Login *********');

    const lp = new LoginPage(page);
    await lp.goto(url);

    try {
      await lp.login(email, password);
    } catch (err) {
      if (String(err.message).includes('Google blocked')) {
        testInfo.skip(
          true,
          'Google blocked automated browser — run headed locally or use storage state'
        );
        return;
      }
      throw err;
    }

    await expect(page).not.toHaveURL(/accounts\.google\.com/i, {
      timeout: 60_000,
    });
    logger.info('********* Verified Successful Login *********');

    await page.screenshot({
      path: path.join(screenshotsDir, 'test_login.png'),
      fullPage: true,
    });

    await lp.clickOnSignOutButton();
  });
});
