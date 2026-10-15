const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { LoginPage } = require('../page-objects/LoginPage');
const { InternalUsers } = require('../page-objects/InternalUsers');
const { ReadConfig } = require('../utils/readConfig');
const { setup } = require('../utils/setup');
const logger = require('../utils/logger');

const screenshotsDir = path.resolve(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * Port of TestCases/test_internalUsers.py
 * Same CDP CF-Access setup as conftest.py → native CRM login (no Google SSO).
 */
test.describe('Test_02_InternalUsers', () => {
  const email = ReadConfig.getEmail();
  const password = ReadConfig.getPassword();

  test('test_internal_users — login then add internal user form flow', async ({
    page,
    context,
  }) => {
    logger.info('********* TestCase_01_Login *********');

    await setup(page, context);
    await expect(page).not.toHaveURL(/accounts\.google\.com/i, {
      timeout: 15_000,
    });

    const lp = new LoginPage(page);
    await lp.setEmail(email);
    await lp.setPassword(password);
    await lp.clickOnEyeIcon();
    await lp.clickOnRememberMe();
    await lp.clickOnSignInButton();
    logger.info('********* Verified Successful Login *********');

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
