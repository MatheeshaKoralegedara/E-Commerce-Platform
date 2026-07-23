
const { query } = require('../config/db');

async function createReview(productId, userId, rating, comment) {
  const result = await query(
    `INSERT INTO reviews (product_id, user_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [productId, userId, rating, comment]
  );
  return result.rows[0];
}

async function getReviewsForProduct(productId) {
  const result = await query(
    `SELECT r.*, u.email AS user_email
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC`,
    [productId]
  );
  return result.rows;
}

async function getReviewSummary(productId) {
  const result = await query(
    `SELECT COUNT(*) AS review_count, COALESCE(AVG(rating), 0) AS average_rating
     FROM reviews
     WHERE product_id = $1`,
    [productId]
  );
  const row = result.rows[0];
  return {
    reviewCount: parseInt(row.review_count),
    averageRating: parseFloat(row.average_rating).toFixed(1),
  };
}

async function updateReview(productId, userId, rating, comment) {
  const result = await query(
    `UPDATE reviews SET rating = $1, comment = $2
     WHERE product_id = $3 AND user_id = $4
     RETURNING *`,
    [rating, comment, productId, userId]
  );
  return result.rows[0];
}

async function deleteReview(productId, userId) {
  await query(`DELETE FROM reviews WHERE product_id = $1 AND user_id = $2`, [productId, userId]);
}

module.exports = {
  createReview,
  getReviewsForProduct,
  getReviewSummary,
  updateReview,
  deleteReview,
};