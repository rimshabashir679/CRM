const fs = require('fs');
const path = require('path');

const defaultAuthPath = path.resolve(__dirname, '..', 'auth', 'user.json');

function getStorageStatePath() {
  if (process.env.STORAGE_STATE) {
    return path.resolve(process.cwd(), process.env.STORAGE_STATE);
  }
  return defaultAuthPath;
}

function hasSavedSession() {
  return fs.existsSync(getStorageStatePath());
}

/**
 * True when the page is already inside the CRM (Google SSO already done).
 * @param {import('@playwright/test').Page} page
 */
async function isAlreadyLoggedIn(page) {
  const url = page.url();
  if (/accounts\.google\.com|cloudflareaccess\.com/i.test(url)) {
    return false;
  }
  if (!/profolio\.ae/i.test(url)) {
    return false;
  }
  // Still on login route → not logged in
  if (/\/login\/?($|\?)/i.test(url)) {
    return false;
  }
  return true;
}

module.exports = {
  getStorageStatePath,
  hasSavedSession,
  isAlreadyLoggedIn,
  defaultAuthPath,
};
