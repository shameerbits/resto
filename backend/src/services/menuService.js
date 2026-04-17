const menuModel = require('../models/menuModel');

function validateMenuPayload(payload) {
  const name = String(payload.name || '').trim();
  const description = payload.description ? String(payload.description).trim() : null;
  const price = Number(payload.price);
  const isAvailable = payload.isAvailable === undefined ? true : Boolean(payload.isAvailable);

  if (!name) {
    return { valid: false, message: 'name is required' };
  }

  if (!Number.isFinite(price) || price < 0) {
    return { valid: false, message: 'price must be a non-negative number' };
  }

  return {
    valid: true,
    data: {
      name,
      description,
      price,
      isAvailable,
    },
  };
}

async function createMenuItem(payload) {
  const validated = validateMenuPayload(payload);
  if (!validated.valid) {
    return { ok: false, statusCode: 400, message: validated.message };
  }

  const newId = await menuModel.createMenuItem(validated.data);
  const item = await menuModel.findMenuItemById(newId);

  return { ok: true, data: item, statusCode: 201 };
}

async function listMenuItems() {
  const items = await menuModel.listMenuItems();
  return { ok: true, data: items, statusCode: 200 };
}

async function getMenuItemById(id) {
  const item = await menuModel.findMenuItemById(id);
  if (!item) {
    return { ok: false, statusCode: 404, message: 'menu item not found' };
  }

  return { ok: true, data: item, statusCode: 200 };
}

async function updateMenuItem(id, payload) {
  const existing = await menuModel.findMenuItemById(id);
  if (!existing) {
    return { ok: false, statusCode: 404, message: 'menu item not found' };
  }

  const validated = validateMenuPayload(payload);
  if (!validated.valid) {
    return { ok: false, statusCode: 400, message: validated.message };
  }

  await menuModel.updateMenuItem(id, validated.data);
  const item = await menuModel.findMenuItemById(id);

  return { ok: true, data: item, statusCode: 200 };
}

async function deleteMenuItem(id) {
  const existing = await menuModel.findMenuItemById(id);
  if (!existing) {
    return { ok: false, statusCode: 404, message: 'menu item not found' };
  }

  await menuModel.deleteMenuItem(id);
  return { ok: true, data: { deleted: true }, statusCode: 200 };
}

module.exports = {
  createMenuItem,
  listMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
};
