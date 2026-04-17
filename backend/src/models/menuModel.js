const { pool } = require('../config/db');

async function createMenuItem({ name, description, price, isAvailable }) {
  const query = `
    INSERT INTO menu_items (name, description, price, is_available)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await pool.query(query, [name, description || null, price, isAvailable]);
  return result.insertId;
}

async function findMenuItemById(id) {
  const [rows] = await pool.query(
    `
      SELECT id, name, description, price, is_available AS isAvailable, created_at AS createdAt, updated_at AS updatedAt
      FROM menu_items
      WHERE id = ?
    `,
    [id]
  );

  return rows[0] || null;
}

async function findMenuItemsByIds(ids) {
  if (!ids.length) {
    return [];
  }

  const placeholders = ids.map(() => '?').join(', ');
  const [rows] = await pool.query(
    `
      SELECT id, name, price, is_available AS isAvailable
      FROM menu_items
      WHERE id IN (${placeholders})
    `,
    ids
  );

  return rows;
}

async function listMenuItems() {
  const [rows] = await pool.query(`
    SELECT id, name, description, price, is_available AS isAvailable, created_at AS createdAt, updated_at AS updatedAt
    FROM menu_items
    ORDER BY id DESC
  `);

  return rows;
}

async function updateMenuItem(id, { name, description, price, isAvailable }) {
  const query = `
    UPDATE menu_items
    SET name = ?,
        description = ?,
        price = ?,
        is_available = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const [result] = await pool.query(query, [name, description || null, price, isAvailable, id]);
  return result.affectedRows;
}

async function deleteMenuItem(id) {
  const [result] = await pool.query('DELETE FROM menu_items WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = {
  createMenuItem,
  findMenuItemById,
  findMenuItemsByIds,
  listMenuItems,
  updateMenuItem,
  deleteMenuItem,
};
