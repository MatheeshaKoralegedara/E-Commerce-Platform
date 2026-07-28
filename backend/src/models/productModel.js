
const { query } = require('../config/db');

async function createProduct({ name, slug, description, categoryId, imageUrl }) {
  const result = await query(
    `INSERT INTO products (name, slug, description, category_id, status, image_url)
     VALUES ($1, $2, $3, $4, 'draft', $5)
     RETURNING *`,
    [name, slug, description, categoryId, imageUrl || null]
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

async function listActiveProducts({ limit = 20, offset = 0, categorySlug = null }) {
  const params = [];
  let categoryJoin = '';
  let categoryWhere = '';

  if (categorySlug) {
    params.push(categorySlug);
    categoryJoin = `JOIN categories c ON c.id = p.category_id`;
    categoryWhere = `AND c.slug = $${params.length}`;
  }

  params.push(limit, offset);

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
     ${categoryJoin}
     WHERE p.status = 'active' ${categoryWhere}
     GROUP BY p.id
     ORDER BY p.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
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
     GROUP BY p.id
     ORDER BY p.created_at DESC`
  );
  return result.rows;
}
async function updateProductStatus(productId, status) {
  const result = await query(
    `UPDATE products SET status = $1 WHERE id = $2 RETURNING *`,
    [status, productId]
  );
  return result.rows[0];
}

async function searchProducts({ q, limit = 20, offset = 0 }) {
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
       AND (p.name ILIKE $1 OR p.description ILIKE $1)
     GROUP BY p.id
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [`%${q}%`, limit, offset]   // ← backticks now
  );
  return result.rows;
}

async function updateProduct(productId, { name, slug, description, categoryId, imageUrl }) {
  const result = await query(
    `UPDATE products
     SET name = $1, slug = $2, description = $3, category_id = $4, image_url = $5
     WHERE id = $6
     RETURNING *`,
    [name, slug, description, categoryId || null, imageUrl || null, productId]
  );
  return result.rows[0];
}

async function deleteVariant(variantId) {
  await query('DELETE FROM product_variants WHERE id = $1', [variantId]);
}

async function bulkUpdateStatus(productIds, status) {
  const result = await query(
    'UPDATE products SET status = $1 WHERE id = ANY($2::int[]) RETURNING *',
    [status, productIds]
  );
  return result.rows;
}

module.exports = {
  createProduct,
  addVariant,
  listActiveProducts,
  getProductBySlug,
  listAllProducts,
  updateProductStatus,
  searchProducts,
  updateProduct,
  deleteVariant,
  bulkUpdateStatus,
};