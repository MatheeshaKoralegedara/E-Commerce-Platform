// backend/src/models/wishlistModel.js
const { query } = require('../config/db');

async function addToWishlist(userId, productId) {
  const result = await query(
    `INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2)
     ON CONFLICT (user_id, product_id) DO NOTHING
     RETURNING *`,
    [userId, productId]
  );
  return result.rows[0];
}

async function removeFromWishlist(userId, productId) {
  const result = await query(
    `DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2 RETURNING id`,
    [userId, productId]
  );
  return result.rows.length > 0;
}

async function getWishlist(userId) {
  const result = await query(
    `SELECT w.id AS wishlist_item_id, w.created_at AS saved_at,
            p.*,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', v.id,
                  'sku', v.sku,
                  'price_cents', v.price_cents,
                  'attributes', v.attributes,
                  'stock_qty', v.stock_qty
                )
              ) FILTER (WHERE v.id IS NOT NULL), '[]'
            ) AS variants
     FROM wishlist_items w
     JOIN products p ON p.id = w.product_id
     LEFT JOIN product_variants v ON v.product_id = p.id
     WHERE w.user_id = $1
     GROUP BY w.id, p.id
     ORDER BY w.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function getWishlistedProductIds(userId) {
  const result = await query(`SELECT product_id FROM wishlist_items WHERE user_id = $1`, [userId]);
  return result.rows.map((r) => r.product_id);
}

module.exports = { addToWishlist, removeFromWishlist, getWishlist, getWishlistedProductIds };
