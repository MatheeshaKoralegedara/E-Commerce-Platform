
const { query } = require('../config/db');

async function createCategory(name, slug, parentId = null) {
  const result = await query(
    `INSERT INTO categories (name, slug, parent_id) VALUES ($1, $2, $3) RETURNING *`,
    [name, slug, parentId]
  );
  return result.rows[0];
}

async function getAllCategories() {
  const result = await query(`SELECT * FROM categories ORDER BY name`);
  return result.rows;
}

async function getCategoryBySlug(slug) {
  const result = await query(`SELECT * FROM categories WHERE slug = $1`, [slug]);
  return result.rows[0];
}

async function updateCategory(id, { name, slug, parentId }) {
  const result = await query(
    `UPDATE categories SET name = $1, slug = $2, parent_id = $3 WHERE id = $4 RETURNING *`,
    [name, slug, parentId, id]
  );
  return result.rows[0];
}

async function deleteCategory(id) {
  // Products referencing this category will have category_id set to NULL automatically
  // if we add ON DELETE SET NULL later — for now, block deletion if products exist, safer default.
  const inUse = await query(`SELECT COUNT(*) FROM products WHERE category_id = $1`, [id]);
  if (parseInt(inUse.rows[0].count) > 0) {
    throw { status: 409, message: 'Cannot delete a category that has products assigned to it' };
  }
  await query(`DELETE FROM categories WHERE id = $1`, [id]);
}

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};