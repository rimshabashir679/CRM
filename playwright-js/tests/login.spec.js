const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { LoginPage } = require('../page-objects/LoginPage');
const { ReadConfig } = require('../utils/readConfig');
const { hasSavedSession, isAlreadyLoggedIn } = require('../utils/auth');
const logger = require('../utils/logger');

const screenshotsDir = path.resolve(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * Port of TestCases/test_loginPage.py — Test_01_LoginPage
 *
 * Bypass Google SSO:
 *   npm run auth:save          # log in once manually
 *   npm run test:bypass        # reuses auth/user.json (no Google)
 */
test.describe('Test_01_LoginPage', () => {
  const url = ReadConfig.getURL();
  const email = ReadConfig.getEmail();
  const password = ReadConfig.getPassword();
  const appUrl = url.replace(/\/login\/?$/, '');

  test('test_login — sign in, capture screenshot, sign out', async ({
    page,
  }, testInfo) => {
    logger.info('********* TestCase_01_Login *********');

    const lp = new LoginPage(page);

    if (hasSavedSession()) {
      // Bypass Google: open the app with the saved session
      logger.info('********* Using saved session — bypassing Google SSO *********');
      await page.goto(appUrl, { waitUntil: 'domcontentloaded' });

      if (!(await isAlreadyLoggedIn(page))) {
        testInfo.skip(
          true,
          'Saved session expired. Run: npm run auth:save'
        );
        return;
      }

      logger.info('********* Verified Successful Login (session bypass) *********');
      await page.screenshot({
        path: path.join(screenshotsDir, 'test_login.png'),
        fullPage: true,
      });
      // Do not sign out when using saved session — keeps auth/user.json valid
      return;
    }

    // No saved session → attempt interactive login (may hit Google)
    await lp.goto(url);
    try {
      await lp.login(email, password);
    } catch (err) {
      if (String(err.message).includes('Google blocked')) {
        testInfo.skip(
          true,
          'Google blocked automation. Bypass it with: npm run auth:save && npm run test:bypass'
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
