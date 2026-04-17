const healthService = require('../services/healthService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

async function apiHealth(req, res) {
  try {
    const data = healthService.getApiHealth();
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch API health', 500);
  }
}

async function dbHealth(req, res) {
  try {
    const data = await healthService.getDatabaseHealth();
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(res, 'Database connection failed', 500);
  }
}

module.exports = {
  apiHealth,
  dbHealth,
};
