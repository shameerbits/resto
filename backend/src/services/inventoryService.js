const inventoryModel = require('../models/inventoryModel');

function parseThreshold(rawThreshold) {
  if (rawThreshold === undefined || rawThreshold === null || rawThreshold === '') {
    return { ok: true, data: 5 };
  }

  const threshold = Number(rawThreshold);
  if (!Number.isFinite(threshold) || threshold < 0) {
    return { ok: false, message: 'threshold must be a non-negative number' };
  }

  return { ok: true, data: Number(threshold.toFixed(3)) };
}

async function getInventoryDashboard() {
  const ingredients = await inventoryModel.listInventoryDashboard();
  return {
    ok: true,
    statusCode: 200,
    data: {
      totalIngredients: ingredients.length,
      ingredients,
    },
  };
}

async function getLowStockAlerts(rawThreshold) {
  const parsedThreshold = parseThreshold(rawThreshold);
  if (!parsedThreshold.ok) {
    return { ok: false, statusCode: 400, message: parsedThreshold.message };
  }

  const ingredients = await inventoryModel.listLowStockIngredients(parsedThreshold.data);

  return {
    ok: true,
    statusCode: 200,
    data: {
      threshold: parsedThreshold.data,
      count: ingredients.length,
      ingredients,
    },
  };
}

module.exports = {
  getInventoryDashboard,
  getLowStockAlerts,
};
