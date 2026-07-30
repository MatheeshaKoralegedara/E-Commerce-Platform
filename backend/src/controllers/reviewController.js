
const {
  createReview,
  getReviewsForProduct,
  getReviewSummary,
  updateReview,
  deleteReview,
  getAllReviews,
  adminDeleteReview
} = require('../models/reviewModel');
const { query } = require('../config/db');
const { logActionSafe } = require('../models/auditLogModel');

// Public: list reviews + summary for a product
async function listForProduct(req, res) {
  try {
    const { productId } = req.params;
    const [reviews, summary] = await Promise.all([
      getReviewsForProduct(productId),
      getReviewSummary(productId),
    ]);
    res.json({ ...summary, reviews });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

// Customer: submit a review (only if they purchased the product)
async function create(req, res) {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify purchase: only customers who actually bought this product can review it.
    // We check order_items joined through orders, restricted to paid/shipped/delivered orders.
    const purchaseCheck = await query(
      `SELECT 1
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN product_variants v ON v.id = oi.variant_id
       WHERE o.user_id = $1
         AND v.product_id = $2
         AND o.status IN ('paid', 'shipped', 'delivered')
       LIMIT 1`,
      [userId, productId]
    );

    if (purchaseCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You can only review products you have purchased' });
    }

    const review = await createReview(productId, userId, rating, comment);
    res.status(201).json(review);
  } catch (err) {
    if (err.code === '23505') { // unique_violation — already reviewed this product
      return res.status(409).json({ error: 'You have already reviewed this product. Use update instead.' });
    }
    req.log.error(err);
    res.status(500).json({ error: 'Failed to create review' });
  }
}

// Customer: update their own review
async function update(req, res) {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const review = await updateReview(productId, req.user.userId, rating, comment);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: 'Failed to update review' });
  }
}

// Customer: delete their own review
async function remove(req, res) {
  try {
    const { productId } = req.params;
    const deleted = await deleteReview(productId, req.user.userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
}

async function adminList(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    const reviews = await getAllReviews({ limit, offset });
    res.json(reviews);
  } catch (err) {
    req.log.error({ err }, 'Failed to fetch all reviews');
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

async function adminRemove(req, res) {
  try {
    const { reviewId } = req.params;
    const deleted = await adminDeleteReview(reviewId);
    if (!deleted) return res.status(404).json({ error: 'Review not found' });

    logActionSafe({
      adminUserId: req.user.userId,
      action: 'review.removed',
      entityType: 'review',
      entityId: parseInt(reviewId),
    });

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, 'Failed to delete review as admin');
    res.status(500).json({ error: 'Failed to delete review' });
  }
}
module.exports = { listForProduct, create, update, remove, adminList, adminRemove };