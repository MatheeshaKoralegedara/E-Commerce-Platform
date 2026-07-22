const { pool } = require('../config/db');

async function createOrderFromCart(userId, cartId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Lock and read cart items together with their current variant state
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

    // Check stock BEFORE attempting any writes
    for (const item of items) {
      if (item.quantity > item.stock_qty) {
        throw { status: 409, message: `Not enough stock for ${item.product_name}` };
      }
    }

    const subtotalCents = items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);

    // Create the order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status, subtotal_cents, total_cents)
       VALUES ($1, 'pending', $2, $2)
       RETURNING *`,
      [userId, subtotalCents]
    );
    const order = orderResult.rows[0];

    // For each item: decrement stock SAFELY (optimistic lock via version check),
    // and snapshot product/price info into order_items
    for (const item of items) {
      const updateResult = await client.query(
        `UPDATE product_variants
         SET stock_qty = stock_qty - $1, version = version + 1
         WHERE id = $2 AND version = $3 AND stock_qty >= $1
         RETURNING *`,
        [item.quantity, item.variant_id, item.version]
      );

      // If no row was updated, someone else modified this variant between our
      // SELECT and this UPDATE (a race condition) — abort the whole order.
      if (updateResult.rows.length === 0) {
        throw { status: 409, message: `Stock changed for ${item.product_name}, please retry` };
      }

      await client.query(
        `INSERT INTO order_items (order_id, variant_id, product_name, unit_price_cents, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.variant_id, item.product_name, item.price_cents, item.quantity]
      );
    }

    // Clear the cart and mark it converted
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

module.exports = { createOrderFromCart };