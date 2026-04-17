const menuModel = require('../models/menuModel');
const orderModel = require('../models/orderModel');
const inventoryModel = require('../models/inventoryModel');

function normalizeOrderItems(items) {
  const merged = new Map();

  for (const rawItem of items) {
    const menuItemId = Number(rawItem.menuItemId);
    const quantity = Number(rawItem.quantity);

    if (!Number.isInteger(menuItemId) || menuItemId <= 0) {
      return { valid: false, message: 'menuItemId must be a positive integer' };
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { valid: false, message: 'quantity must be a positive integer' };
    }

    const currentQty = merged.get(menuItemId) || 0;
    merged.set(menuItemId, currentQty + quantity);
  }

  const normalizedItems = Array.from(merged.entries()).map(([menuItemId, quantity]) => ({
    menuItemId,
    quantity,
  }));

  return { valid: true, data: normalizedItems };
}

function validateCreateOrderPayload(payload) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const notes = payload.notes ? String(payload.notes).trim() : null;

  if (!items.length) {
    return { valid: false, message: 'items must be a non-empty array' };
  }

  const normalized = normalizeOrderItems(items);
  if (!normalized.valid) {
    return normalized;
  }

  return {
    valid: true,
    data: {
      items: normalized.data,
      notes,
    },
  };
}

async function buildPricedItems(orderItems) {
  const menuIds = orderItems.map((item) => item.menuItemId);
  const menuItems = await menuModel.findMenuItemsByIds(menuIds);

  const menuMap = new Map(menuItems.map((item) => [item.id, item]));

  for (const item of orderItems) {
    if (!menuMap.has(item.menuItemId)) {
      return { ok: false, statusCode: 400, message: `menu item ${item.menuItemId} not found` };
    }
  }

  for (const item of orderItems) {
    const menuItem = menuMap.get(item.menuItemId);
    if (!menuItem.isAvailable) {
      return { ok: false, statusCode: 400, message: `menu item ${item.menuItemId} is not available` };
    }
  }

  const pricedItems = orderItems.map((item) => {
    const menuItem = menuMap.get(item.menuItemId);
    const unitPrice = Number(menuItem.price);
    const lineTotal = Number((unitPrice * item.quantity).toFixed(2));

    return {
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
    };
  });

  return { ok: true, data: pricedItems };
}

function calculateTotalAmount(pricedItems) {
  const total = pricedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  return Number(total.toFixed(2));
}

function buildIngredientRequirements(orderItems, recipeRows) {
  const recipeMapByMenuItem = new Map();

  for (const row of recipeRows) {
    const rowsForMenuItem = recipeMapByMenuItem.get(row.menuItemId) || [];
    rowsForMenuItem.push(row);
    recipeMapByMenuItem.set(row.menuItemId, rowsForMenuItem);
  }

  for (const item of orderItems) {
    if (!recipeMapByMenuItem.has(item.menuItemId)) {
      return {
        ok: false,
        statusCode: 400,
        message: `recipe not configured for menu item ${item.menuItemId}`,
      };
    }
  }

  const requirementMap = new Map();

  for (const item of orderItems) {
    const recipeIngredients = recipeMapByMenuItem.get(item.menuItemId);

    for (const recipe of recipeIngredients) {
      const perItemQty = Number(recipe.quantityRequired);
      const requiredQty = Number((perItemQty * item.quantity).toFixed(3));
      const currentQty = requirementMap.get(recipe.ingredientId) || 0;
      requirementMap.set(recipe.ingredientId, Number((currentQty + requiredQty).toFixed(3)));
    }
  }

  const requiredIngredients = Array.from(requirementMap.entries()).map(
    ([ingredientId, quantityToDeduct]) => ({ ingredientId, quantityToDeduct })
  );

  return {
    ok: true,
    data: requiredIngredients,
  };
}

async function getOrderById(id) {
  const order = await orderModel.findOrderById(id);
  if (!order) {
    return { ok: false, statusCode: 404, message: 'order not found' };
  }

  const items = await orderModel.findOrderItemsByOrderId(id);

  return {
    ok: true,
    statusCode: 200,
    data: {
      ...order,
      items,
    },
  };
}

async function createOrder(payload) {
  const validated = validateCreateOrderPayload(payload);
  if (!validated.valid) {
    return { ok: false, statusCode: 400, message: validated.message };
  }

  const pricedItemsResult = await buildPricedItems(validated.data.items);
  if (!pricedItemsResult.ok) {
    return pricedItemsResult;
  }

  const totalAmount = calculateTotalAmount(pricedItemsResult.data);

  const menuItemIds = validated.data.items.map((item) => item.menuItemId);
  const recipeRows = await inventoryModel.findRecipeIngredientsByMenuItemIds(menuItemIds);
  const inventoryRequirements = buildIngredientRequirements(validated.data.items, recipeRows);
  if (!inventoryRequirements.ok) {
    return inventoryRequirements;
  }

  let orderId;
  try {
    orderId = await orderModel.createOrderWithItems({
      items: pricedItemsResult.data,
      totalAmount,
      notes: validated.data.notes,
      requiredIngredients: inventoryRequirements.data,
    });
  } catch (error) {
    if (error.code === 'INSUFFICIENT_INVENTORY') {
      return {
        ok: false,
        statusCode: 400,
        message: `insufficient inventory for ingredient ${error.ingredientId}`,
      };
    }

    if (error.code === 'INVENTORY_INGREDIENT_NOT_FOUND') {
      return {
        ok: false,
        statusCode: 400,
        message: `ingredient ${error.ingredientId} not found`,
      };
    }

    throw error;
  }

  const orderResult = await getOrderById(orderId);
  return {
    ok: true,
    statusCode: 201,
    data: orderResult.data,
  };
}

function parseTaxPercent(rawTaxPercent) {
  if (rawTaxPercent === undefined || rawTaxPercent === null || rawTaxPercent === '') {
    return { ok: true, data: 0 };
  }

  const taxPercent = Number(rawTaxPercent);
  if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
    return { ok: false, message: 'taxPercent must be a number between 0 and 100' };
  }

  return { ok: true, data: Number(taxPercent.toFixed(2)) };
}

async function getOrderBill(id, rawTaxPercent) {
  const taxPercentResult = parseTaxPercent(rawTaxPercent);
  if (!taxPercentResult.ok) {
    return { ok: false, statusCode: 400, message: taxPercentResult.message };
  }

  const orderResult = await getOrderById(id);
  if (!orderResult.ok) {
    return orderResult;
  }

  const subtotal = Number(orderResult.data.totalAmount);
  const taxPercent = taxPercentResult.data;
  const taxAmount = Number(((subtotal * taxPercent) / 100).toFixed(2));
  const finalTotal = Number((subtotal + taxAmount).toFixed(2));

  return {
    ok: true,
    statusCode: 200,
    data: {
      orderId: orderResult.data.id,
      status: orderResult.data.status,
      notes: orderResult.data.notes,
      createdAt: orderResult.data.createdAt,
      items: orderResult.data.items,
      subtotal,
      taxPercent,
      taxAmount,
      finalTotal,
    },
  };
}

module.exports = {
  createOrder,
  getOrderById,
  getOrderBill,
};
