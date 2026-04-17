const { pingDatabase } = require('../config/db');

async function checkDatabaseConnection() {
  return pingDatabase();
}

module.exports = {
  checkDatabaseConnection,
};
