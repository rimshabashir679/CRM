const base = require('@playwright/test');
const { setup } = require('../utils/setup');

/**
 * Custom fixtures that mirror Selenium conftest.py setup():
 * browser → new context + CF headers → goto /sales-companion
 */
exports.test = base.test.extend({
  // Replace default page with one that went through setup()
  crm: async ({ browser }, use) => {
    const { context, page } = await setup(browser);
    await use({ context, page });
    await context.close();
  },
});

exports.expect = base.expect;
