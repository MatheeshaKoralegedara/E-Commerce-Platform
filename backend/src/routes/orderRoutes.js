
const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { checkoutLimiter } = require('../middleware/rateLimiters');
const {
  checkout,
  myOrders,
  myOrderDetail,
  adminListOrders,
  adminOrderDetail,
  adminUpdateStatus,
} = require('../controllers/orderController');
const { runAbandonedCleanup } = require('../controllers/orderController');

const router = express.Router();

function requireCronSecret(req, res, next) {
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Customer routes
router.post('/checkout', checkoutLimiter, requireAuth, checkout);
router.get('/my', requireAuth, myOrders);
router.get('/my/:orderId', requireAuth, myOrderDetail);

// Admin routes
router.get('/admin/all', requireAuth, requireAdmin, adminListOrders);
router.get('/admin/:orderId', requireAuth, requireAdmin, adminOrderDetail);
router.patch('/admin/:orderId/status', requireAuth, requireAdmin, adminUpdateStatus);
router.post('/admin/cleanup-abandoned', requireCronSecret, runAbandonedCleanup);

module.exports = router;