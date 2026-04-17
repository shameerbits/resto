const healthModel = require('../models/healthModel');

function getApiHealth() {
  return {
    status: 'ok',
    service: 'resto-backend',
    timestamp: new Date().toISOString(),
  };
}

async function getDatabaseHealth() {
  const isConnected = await healthModel.checkDatabaseConnection();

  return {
    database: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  getApiHealth,
  getDatabaseHealth,
};
