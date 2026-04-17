const { pool } = require('../config/db');

async function findRecipeIngredientsByMenuItemIds(menuItemIds) {
  if (!menuItemIds.length) {
    return [];
  }

  const placeholders = menuItemIds.map(() => '?').join(', ');
  const [rows] = await pool.query(
    `
      SELECT
        mir.menu_item_id AS menuItemId,
        mir.ingredient_id AS ingredientId,
        mir.quantity_required AS quantityRequired,
        i.name AS ingredientName,
        i.unit,
        i.stock_quantity AS stockQuantity
      FROM menu_item_recipes mir
      INNER JOIN ingredients i ON i.id = mir.ingredient_id
      WHERE mir.menu_item_id IN (${placeholders})
    `,
    menuItemIds
  );

  return rows;
}

async function listInventoryDashboard() {
  const [rows] = await pool.query(
    `
      SELECT
        i.id,
        i.name,
        i.unit,
        i.stock_quantity AS stockQuantity,
        COUNT(mir.id) AS usedInMenuItems,
        i.updated_at AS updatedAt
      FROM ingredients i
      LEFT JOIN menu_item_recipes mir ON mir.ingredient_id = i.id
      GROUP BY i.id, i.name, i.unit, i.stock_quantity, i.updated_at
      ORDER BY i.name ASC
    `
  );

  return rows;
}

async function listLowStockIngredients(threshold) {
  const [rows] = await pool.query(
    `
      SELECT
        i.id,
        i.name,
        i.unit,
        i.stock_quantity AS stockQuantity,
        i.updated_at AS updatedAt
      FROM ingredients i
      WHERE i.stock_quantity <= ?
      ORDER BY i.stock_quantity ASC, i.name ASC
    `,
    [threshold]
  );

  return rows;
}

module.exports = {
  findRecipeIngredientsByMenuItemIds,
  listInventoryDashboard,
  listLowStockIngredients,
};
