const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * App configuration — mirrors Configurations/config.ini from the Python project.
 * Prefer environment variables; fall back to the same defaults used by the Selenium suite.
 */
module.exports = {
  baseURL:
    process.env.BASE_URL ||
    'https://neo.staging.profolio.ae/sales-companion/login',
  email: process.env.CRM_EMAIL || 'system-admin@bayut.com',
  password: process.env.CRM_PASSWORD || 'Ace#7651@',
  cfAccessClientId:
    process.env.CF_ACCESS_CLIENT_ID ||
    '42f24e5a1aa5dd4011f8223e3a366fc3.access',
  cfAccessClientSecret:
    process.env.CF_ACCESS_CLIENT_SECRET ||
    '51c68482765060cd76d50a5595534a0bf221a6afe4b4eb6262f5859485ac425a',
};
