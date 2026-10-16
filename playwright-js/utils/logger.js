const fs = require('fs');
const path = require('path');

const logsDir = path.resolve(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'automation.log');

/**
 * Simple file + console logger (mirrors Utilities/customLogger.py).
 */
function log(level, message) {
  const line = `${new Date().toISOString()} - ${level.toUpperCase()} - ${message}`;
  console.log(line);
  fs.appendFileSync(logFile, line + '\n');
}

module.exports = {
  info: (message) => log('info', message),
  warn: (message) => log('warn', message),
  error: (message) => log('error', message),
};
