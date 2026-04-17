const inventoryService = require('../services/inventoryService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

async function getInventoryDashboard(req, res) {
  try {
    const result = await inventoryService.getInventoryDashboard();
    return successResponse(res, result.data, result.statusCode);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch inventory dashboard', 500);
  }
}

async function getLowStockAlerts(req, res) {
  try {
    const result = await inventoryService.getLowStockAlerts(req.query.threshold);
    if (!result.ok) {
      return errorResponse(res, result.message, result.statusCode);
    }

    return successResponse(res, result.data, result.statusCode);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch low stock alerts', 500);
  }
}

module.exports = {
  getInventoryDashboard,
  getLowStockAlerts,
};
