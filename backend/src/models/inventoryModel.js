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

module.exports = {
  findRecipeIngredientsByMenuItemIds,
};
