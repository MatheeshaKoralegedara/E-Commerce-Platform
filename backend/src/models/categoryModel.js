const { query } = require('../config/db');

async function createCategory(name, slug, parentId = null) {
    const result = await query(
        'INSERT INTO categories (name, slug, parent_id) VALUES ($1, $2, $3) RETURNING *',
        [name, slug, parentId]
    );
    return result.rows[0];
}

async function getCategories() {
    const result = await query('SELECT * FROM categories ORDER BY name');
    return result.rows;
}

module.exports = { createCategory, getAllCategories };