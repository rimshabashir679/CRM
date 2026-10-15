const path = require('path');
const fs = require('fs');
const { test, expect } = require('./fixtures');
const { LoginPage } = require('../page-objects/LoginPage');
const { InternalUsers } = require('../page-objects/InternalUsers');
const { ReadConfig } = require('../utils/readConfig');
const { hasSavedSession } = require('../utils/auth');
const logger = require('../utils/logger');

const screenshotsDir = path.resolve(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe('Test_02_InternalUsers', () => {
  const email = ReadConfig.getEmail();
  const password = ReadConfig.getPassword();

  test('test_internal_users — login then add internal user form flow', async ({
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

    const lp = new LoginPage(page);

    if (!(hasSavedSession() && !/\/login\/?($|\?)/i.test(page.url()))) {
      await lp.setEmail(email);
      await lp.setPassword(password);
      await lp.clickOnEyeIcon();
      await lp.clickOnRememberMe();
      await lp.clickOnSignInButton();
    }
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
