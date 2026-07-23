
const { pool, query } = require('../config/db');
const { validateDiscountCode } = require('./discountModel');

async function createOrderFromCart(userId, cartId, discountCodeStr = null) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const itemsResult = await client.query(
      `SELECT ci.variant_id, ci.quantity, v.price_cents, v.stock_qty, v.version, p.name AS product_name
       FROM cart_items ci
       JOIN product_variants v ON v.id = ci.variant_id
       JOIN products p ON p.id = v.product_id
       WHERE ci.cart_id = $1`,
      [cartId]
    );
    const items = itemsResult.rows;

    if (items.length === 0) {
      throw { status: 400, message: 'Cart is empty' };
    }

    for (const item of items) {
      if (item.quantity > item.stock_qty) {
        throw { status: 409, message: `Not enough stock for ${item.product_name}` };
      }
    }

    const subtotalCents = items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);

    // Validate and apply discount code, if provided
    let discountCents = 0;
    let discountCodeId = null;
    if (discountCodeStr) {
      const validation = await validateDiscountCode(discountCodeStr, subtotalCents);
      if (!validation.valid) {
        throw { status: 400, message: validation.error };
      }
      discountCents = validation.discountCents;
      discountCodeId = validation.discountCode.id;
    }

    const totalCents = subtotalCents - discountCents;

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status, subtotal_cents, discount_cents, discount_code_id, total_cents)
       VALUES ($1, 'pending', $2, $3, $4, $5)
       RETURNING *`,
      [userId, subtotalCents, discountCents, discountCodeId, totalCents]
    );
    const order = orderResult.rows[0];

    for (const item of items) {
      const updateResult = await client.query(
        `UPDATE product_variants
         SET stock_qty = stock_qty - $1, version = version + 1
         WHERE id = $2 AND version = $3 AND stock_qty >= $1
         RETURNING *`,
        [item.quantity, item.variant_id, item.version]
      );

      if (updateResult.rows.length === 0) {
        throw { status: 409, message: `Stock changed for ${item.product_name}, please retry` };
      }

      await client.query(
        `INSERT INTO order_items (order_id, variant_id, product_name, unit_price_cents, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.variant_id, item.product_name, item.price_cents, item.quantity]
      );
    }

    // Increment usage count for the discount code, still inside the same transaction
    if (discountCodeId) {
      await client.query(
        `UPDATE discount_codes SET times_used = times_used + 1 WHERE id = $1`,
        [discountCodeId]
      );
    }

    await client.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);
    await client.query(`UPDATE carts SET status = 'converted' WHERE id = $1`, [cartId]);

    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getOrdersForUser(userId) {
  const result = await query(
    `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function getOrderWithItems(orderId, userId = null) {
  const orderQuery = userId
    ? `SELECT * FROM orders WHERE id = $1 AND user_id = $2`
    : `SELECT * FROM orders WHERE id = $1`;
  const orderParams = userId ? [orderId, userId] : [orderId];

  const orderResult = await query(orderQuery, orderParams);
  const order = orderResult.rows[0];
  if (!order) return null;

  const itemsResult = await query(
    `SELECT * FROM order_items WHERE order_id = $1`,
    [orderId]
  );

  return { ...order, items: itemsResult.rows };
}

async function getAllOrders({ status, limit = 50, offset = 0 }) {
  const params = [];
  let where = '';

  if (status) {
    params.push(status);
    where = `WHERE status = $${params.length}`;
  }

  params.push(limit, offset);
  const result = await query(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return result.rows;
}

async function updateOrderStatus(orderId, status) {
  const result = await query(
    `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
    [status, orderId]
  );
  return result.rows[0];
}

module.exports = {
  createOrderFromCart,
  getOrdersForUser,
  getOrderWithItems,
  getAllOrders,
  updateOrderStatus,
};