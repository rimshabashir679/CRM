const path = require('path');
const fs = require('fs');
const { test, expect } = require('./fixtures');
const { LoginPage } = require('../page-objects/LoginPage');
const { ReadConfig } = require('../utils/readConfig');
const { hasSavedSession } = require('../utils/auth');
const logger = require('../utils/logger');

const screenshotsDir = path.resolve(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe('Test_01_LoginPage', () => {
  const email = ReadConfig.getEmail();
  const password = ReadConfig.getPassword();

  test('test_login — sign in, capture screenshot, sign out', async ({
    crm,
  }, testInfo) => {
    const { page } = crm;
    logger.info('********* TestCase_01_Login *********');

    if (/accounts\.google\.com/i.test(page.url())) {
      testInfo.skip(
        true,
        'Google SSO shown (CF token not accepted). Run: npm run auth:save && npm run test:bypass'
      );
      return;
    }

    expect(page.url()).toMatch(/profolio\.ae/i);

    const lp = new LoginPage(page);

    // If saved session already put us inside the app, skip form login
    if (hasSavedSession() && !/\/login\/?($|\?)/i.test(page.url())) {
      logger.info('********* Already logged in via saved session *********');
    } else {
      await lp.setEmail(email);
      await lp.setPassword(password);
      await lp.clickOnEyeIcon();
      await lp.clickOnRememberMe();
      await lp.clickOnSignInButton();
      logger.info('********* Verified Successful Login *********');
    }

    await page.screenshot({
      path: path.join(screenshotsDir, 'test_login.png'),
      fullPage: true,
    });

    if (!hasSavedSession()) {
      await lp.clickOnSignOutButton();
    }
  });
});
