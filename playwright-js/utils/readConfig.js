const config = require('../Configurations/config');

/**
 * Read config helpers (mirrors Utilities/ReadProperties.py).
 */
class ReadConfig {
  static getURL() {
    return config.baseURL;
  }

  /** Same entry URL as Selenium conftest.py setup() */
  static getAppURL() {
    return config.appURL;
  }

  static getEmail() {
    return config.email;
  }

  static getPassword() {
    return config.password;
  }

  static getCfAccessClientId() {
    return config.cfAccessClientId;
  }

  static getCfAccessClientSecret() {
    return config.cfAccessClientSecret;
  }
}

module.exports = { ReadConfig };
