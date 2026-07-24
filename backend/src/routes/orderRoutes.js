
const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  checkout,
  myOrders,
  myOrderDetail,
  adminListOrders,
  adminOrderDetail,
  adminUpdateStatus,
} = require('../controllers/orderController');

const router = express.Router();

// Customer routes
router.post('/checkout', requireAuth, checkout);
router.get('/my', requireAuth, myOrders);
router.get('/my/:orderId', requireAuth, myOrderDetail);

// Admin routes
router.get('/admin/all', requireAuth, requireAdmin, adminListOrders);
router.get('/admin/:orderId', requireAuth, requireAdmin, adminOrderDetail);
router.patch('/admin/:orderId/status', requireAuth, requireAdmin, adminUpdateStatus);

module.exports = router;