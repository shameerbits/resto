const { pool } = require('../config/db');

async function createOrderWithItems({ items, totalAmount, notes }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `
        INSERT INTO orders (status, total_amount, notes)
        VALUES (?, ?, ?)
      `,
      ['PENDING', totalAmount, notes || null]
    );

    const orderId = orderResult.insertId;

    const insertItemSql = `
      INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_total)
      VALUES (?, ?, ?, ?, ?)
    `;

    for (const item of items) {
      await connection.query(insertItemSql, [
        orderId,
        item.menuItemId,
        item.quantity,
        item.unitPrice,
        item.lineTotal,
      ]);
    }

    await connection.commit();
    return orderId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function findOrderById(id) {
  const [rows] = await pool.query(
    `
      SELECT id, status, total_amount AS totalAmount, notes, created_at AS createdAt, updated_at AS updatedAt
      FROM orders
      WHERE id = ?
    `,
    [id]
  );

  return rows[0] || null;
}

async function findOrderItemsByOrderId(orderId) {
  const [rows] = await pool.query(
    `
      SELECT
        oi.id,
        oi.menu_item_id AS menuItemId,
        mi.name AS menuItemName,
        oi.quantity,
        oi.unit_price AS unitPrice,
        oi.line_total AS lineTotal
      FROM order_items oi
      INNER JOIN menu_items mi ON mi.id = oi.menu_item_id
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC
    `,
    [orderId]
  );

  return rows;
}

module.exports = {
  createOrderWithItems,
  findOrderById,
  findOrderItemsByOrderId,
};
