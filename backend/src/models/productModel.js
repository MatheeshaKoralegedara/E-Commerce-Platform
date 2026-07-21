
const { query } = require('../config/db');

async function createProduct({ name, slug, description, categoryId }) {
  const result = await query(
    `INSERT INTO products (name, slug, description, category_id, status)
     VALUES ($1, $2, $3, $4, 'draft')
     RETURNING *`,
    [name, slug, description, categoryId]
  );
  return result.rows[0];
}

async function addVariant({ productId, sku, priceCents, attributes, stockQty }) {
  const result = await query(
    `INSERT INTO product_variants (product_id, sku, price_cents, attributes, stock_qty)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [productId, sku, priceCents, JSON.stringify(attributes || {}), stockQty]
  );
  return result.rows[0];
}

// Public: only active products, with their variants attached
async function listActiveProducts({ limit = 20, offset = 0 }) {
  const result = await query(
    `SELECT p.*,
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
     FROM products p
     LEFT JOIN product_variants v ON v.product_id = p.id
     WHERE p.status = 'active'
     GROUP BY p.id
     ORDER BY p.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

async function getProductBySlug(slug) {
  const result = await query(
    `SELECT p.*,
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
     FROM products p
     LEFT JOIN product_variants v ON v.product_id = p.id
     WHERE p.slug = $1
     GROUP BY p.id`,
    [slug]
  );
  return result.rows[0];
}

// Admin: all products regardless of status
async function listAllProducts() {
  const result = await query(`SELECT * FROM products ORDER BY created_at DESC`);
  return result.rows;
}

async function updateProductStatus(productId, status) {
  const result = await query(
    `UPDATE products SET status = $1 WHERE id = $2 RETURNING *`,
    [status, productId]
  );
  return result.rows[0];
}

module.exports = {
  createProduct,
  addVariant,
  listActiveProducts,
  getProductBySlug,
  listAllProducts,
  updateProductStatus,
};