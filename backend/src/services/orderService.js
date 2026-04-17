const menuModel = require('../models/menuModel');
const orderModel = require('../models/orderModel');

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

  const orderId = await orderModel.createOrderWithItems({
    items: pricedItemsResult.data,
    totalAmount,
    notes: validated.data.notes,
  });

  const orderResult = await getOrderById(orderId);
  return {
    ok: true,
    statusCode: 201,
    data: orderResult.data,
  };
}

module.exports = {
  createOrder,
  getOrderById,
};
