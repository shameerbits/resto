const menuService = require('../services/menuService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

async function createMenuItem(req, res) {
  try {
    const result = await menuService.createMenuItem(req.body);
    if (!result.ok) {
      return errorResponse(res, result.message, result.statusCode);
    }

    return successResponse(res, result.data, result.statusCode);
  } catch (error) {
    return errorResponse(res, 'Failed to create menu item', 500);
  }
}

async function listMenuItems(req, res) {
  try {
    const result = await menuService.listMenuItems();
    return successResponse(res, result.data, result.statusCode);
  } catch (error) {
    return errorResponse(res, 'Failed to list menu items', 500);
  }
}

async function getMenuItemById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return errorResponse(res, 'id must be a positive integer', 400);
    }

    const result = await menuService.getMenuItemById(id);
    if (!result.ok) {
      return errorResponse(res, result.message, result.statusCode);
    }

    return successResponse(res, result.data, result.statusCode);
  } catch (error) {
    return errorResponse(res, 'Failed to get menu item', 500);
  }
}

async function updateMenuItem(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return errorResponse(res, 'id must be a positive integer', 400);
    }

    const result = await menuService.updateMenuItem(id, req.body);
    if (!result.ok) {
      return errorResponse(res, result.message, result.statusCode);
    }

    return successResponse(res, result.data, result.statusCode);
  } catch (error) {
    return errorResponse(res, 'Failed to update menu item', 500);
  }
}

async function deleteMenuItem(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return errorResponse(res, 'id must be a positive integer', 400);
    }

    const result = await menuService.deleteMenuItem(id);
    if (!result.ok) {
      return errorResponse(res, result.message, result.statusCode);
    }

    return successResponse(res, result.data, result.statusCode);
  } catch (error) {
    return errorResponse(res, 'Failed to delete menu item', 500);
  }
}

async function getMenuItemCost(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return errorResponse(res, 'id must be a positive integer', 400);
    }

    const result = await menuService.getMenuItemCost(id);
    if (!result.ok) {
      return errorResponse(res, result.message, result.statusCode);
    }

    return successResponse(res, result.data, result.statusCode);
  } catch (error) {
    return errorResponse(res, 'Failed to calculate menu item cost', 500);
  }
}

module.exports = {
  createMenuItem,
  listMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemCost,
};
