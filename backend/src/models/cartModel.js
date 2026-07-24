// backend/src/models/cartModel.js
const { query } = require('../config/db');

// Get or create an active cart for a user
async function getOrCreateCart(userId) {
  const existing = await query(
    `SELECT * FROM carts WHERE user_id = $1 AND status = 'active'`,
    [userId]
  );
  if (existing.rows[0]) return existing.rows[0];

  const created = await query(
    `INSERT INTO carts (user_id, status) VALUES ($1, 'active') RETURNING *`,
    [userId]
  );
  return created.rows[0];
}

async function addItem(cartId, variantId, quantity) {
  // ON CONFLICT: if this variant is already in the cart, increase quantity instead of erroring
  const result = await query(
    `INSERT INTO cart_items (cart_id, variant_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, variant_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
     RETURNING *`,
    [cartId, variantId, quantity]
  );
  return result.rows[0];
}

async function updateItemQuantity(cartId, variantId, quantity) {
  if (quantity <= 0) {
    await query(`DELETE FROM cart_items WHERE cart_id = $1 AND variant_id = $2`, [cartId, variantId]);
    return null;
  }
  const result = await query(
    `UPDATE cart_items SET quantity = $3 WHERE cart_id = $1 AND variant_id = $2 RETURNING *`,
    [cartId, variantId, quantity]
  );
  return result.rows[0];
}

async function getCartWithItems(cartId) {
  const result = await query(
    `SELECT ci.variant_id, ci.quantity,
            v.sku, v.price_cents, v.stock_qty, v.attributes,
            p.name AS product_name
     FROM cart_items ci
     JOIN product_variants v ON v.id = ci.variant_id
     JOIN products p ON p.id = v.product_id
     WHERE ci.cart_id = $1`,
    [cartId]
  );
  return result.rows;
}

module.exports = { getOrCreateCart, addItem, updateItemQuantity, getCartWithItems };