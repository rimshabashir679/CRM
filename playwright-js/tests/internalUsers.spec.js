const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { LoginPage } = require('../page-objects/LoginPage');
const { InternalUsers } = require('../page-objects/InternalUsers');
const { ReadConfig } = require('../utils/readConfig');
const { hasSavedSession, isAlreadyLoggedIn } = require('../utils/auth');
const logger = require('../utils/logger');

const screenshotsDir = path.resolve(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * Port of TestCases/test_internalUsers.py — Test_02_InternalUsers
 *
 * Bypass Google SSO:
 *   npm run auth:save
 *   npm run test:bypass
 */
test.describe('Test_02_InternalUsers', () => {
  const url = ReadConfig.getURL();
  const email = ReadConfig.getEmail();
  const password = ReadConfig.getPassword();
  const appUrl = url.replace(/\/login\/?$/, '');

  test('test_internal_users — login then add internal user form flow', async ({
    page,
  }, testInfo) => {
    logger.info('********* TestCase_01_Login *********');

    const lp = new LoginPage(page);

    if (hasSavedSession()) {
      logger.info('********* Using saved session — bypassing Google SSO *********');
      await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
      if (!(await isAlreadyLoggedIn(page))) {
        testInfo.skip(true, 'Saved session expired. Run: npm run auth:save');
        return;
      }
      logger.info('********* Verified Successful Login (session bypass) *********');
    } else {
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
    }

    const iu = new InternalUsers(page);
    await iu.clickOnInternalUserMenuButton();
    logger.info('********* Internal Users *********');

    await iu.clickOnAddNewInternalUserMenuButton();
    logger.info('********* Add New Internal User *********');

    await iu.addName('Automated Test User');
    await iu.addEmail('automatedtestuser@mailinator.com');
    await iu.addPassword('Rimsha1122!');
    await iu.clickOnAddGroupButton();

    await page.screenshot({
      path: path.join(screenshotsDir, 'test_internalUser.png'),
      fullPage: true,
    });
  });
});
