const orderService = require('../services/orderService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

async function createOrder(req, res) {
  try {
    const result = await orderService.createOrder(req.body);
    if (!result.ok) {
      return errorResponse(res, result.message, result.statusCode);
    }

    return successResponse(res, result.data, result.statusCode);
  } catch (error) {
    return errorResponse(res, 'Failed to create order', 500);
  }
}

async function getOrderById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return errorResponse(res, 'id must be a positive integer', 400);
    }

    const result = await orderService.getOrderById(id);
    if (!result.ok) {
      return errorResponse(res, result.message, result.statusCode);
    }

    return successResponse(res, result.data, result.statusCode);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch order', 500);
  }
}

async function getOrderBill(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return errorResponse(res, 'id must be a positive integer', 400);
    }

    const result = await orderService.getOrderBill(id, req.query.taxPercent);
    if (!result.ok) {
      return errorResponse(res, result.message, result.statusCode);
    }

    return successResponse(res, result.data, result.statusCode);
  } catch (error) {
    return errorResponse(res, 'Failed to generate bill', 500);
  }
}

module.exports = {
  createOrder,
  getOrderById,
  getOrderBill,
};
