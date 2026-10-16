const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * App configuration — mirrors Configurations/config.ini + conftest.py
 */
module.exports = {
  // Native CRM login form URL (after CF Access bypass)
  baseURL:
    process.env.BASE_URL ||
    'https://neo.staging.profolio.ae/sales-companion/login',
  // Same entry URL as Selenium conftest.py setup()
  appURL:
    process.env.APP_URL ||
    'https://neo.staging.profolio.ae/sales-companion',
  email: process.env.CRM_EMAIL || 'system-admin@bayut.com',
  password: process.env.CRM_PASSWORD || 'Ace#7651@',
  // Same CF Access service-token headers as conftest.py
  cfAccessClientId:
    process.env.CF_ACCESS_CLIENT_ID ||
    '42f24e5a1aa5dd4011f8223e3a366fc3.access',
  cfAccessClientSecret:
    process.env.CF_ACCESS_CLIENT_SECRET ||
    '51c68482765060cd76d50a5595534a0bf221a6afe4b4eb6262f5859485ac425a',
};
