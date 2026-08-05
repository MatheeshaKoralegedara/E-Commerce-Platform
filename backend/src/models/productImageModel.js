const { query } = require('../config/db');

async function addProductImage(productId, imageUrl, sortOrder = 0) {
  const result = await query(
    `INSERT INTO product_images (product_id, image_url, sort_order) VALUES ($1, $2, $3) RETURNING *`,
    [productId, imageUrl, sortOrder]
  );
  return result.rows[0];
}

async function getProductImages(productId) {
  const result = await query(
    `SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC, id ASC`,
    [productId]
  );
  return result.rows;
}

async function deleteProductImage(imageId) {
  const result = await query(`DELETE FROM product_images WHERE id = $1 RETURNING id`, [imageId]);
  return result.rows.length > 0;
}

async function reorderProductImages(productId, orderedIds) {
  // orderedIds is an array of image ids in the desired display order
  for (let i = 0; i < orderedIds.length; i++) {
    await query(
      `UPDATE product_images SET sort_order = $1 WHERE id = $2 AND product_id = $3`,
      [i, orderedIds[i], productId]
    );
  }
}

module.exports = { addProductImage, getProductImages, deleteProductImage, reorderProductImages };