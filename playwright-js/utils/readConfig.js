const config = require('../Configurations/config');

/**
 * Read config helpers (mirrors Utilities/ReadProperties.py).
 */
class ReadConfig {
  static getURL() {
    return config.baseURL;
  }

  static getEmail() {
    return config.email;
  }

  static getPassword() {
    return config.password;
  }
}

module.exports = { ReadConfig };
