
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

// backend/src/models/reviewModel.js

function maskEmail(email) {
  const [localPart] = email.split('@');
  if (localPart.length <= 3) {
    return localPart[0] + '*'.repeat(Math.max(localPart.length - 1, 1));
  }
  return localPart.slice(0, 3) + '*'.repeat(localPart.length - 3);
}

async function getReviewsForProduct(productId) {
  const result = await query(
    `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at, u.email
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC`,
    [productId]
  );

  // Mask emails here, server-side, before they ever leave the database layer
  return result.rows.map((row) => ({
    ...row,
    email: undefined,
    masked_email: maskEmail(row.email),
  }));
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
  const result = await query(
    'DELETE FROM reviews WHERE product_id = $1 AND user_id = $2 RETURNING id',
    [productId, userId]
  );
  return result.rows.length > 0;
}

module.exports = {
  createReview,
  getReviewsForProduct,
  getReviewSummary,
  updateReview,
  deleteReview,
  maskEmail,
};