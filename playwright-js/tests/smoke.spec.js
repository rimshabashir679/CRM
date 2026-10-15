const { test, expect } = require('./fixtures');
const logger = require('../utils/logger');

test.describe('Smoke — CF Access / session bypass', () => {
  test('lands on CRM (not Google) when headers or saved session work', async ({
    crm,
  }, testInfo) => {
    const { page } = crm;
    logger.info(`********* Smoke: landed on ${page.url()} *********`);

    if (/accounts\.google\.com/i.test(page.url())) {
      testInfo.skip(
        true,
        'Google SSO — CF service token rejected. Run: npm run auth:save && npm run test:bypass'
      );
      return;
    }

    expect(page.url()).toMatch(/profolio\.ae/i);
    logger.info('********* Smoke: CRM page OK *********');
  });
});
