
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { checkout } = require('../controllers/orderController');

const router = express.Router();
router.post('/checkout', requireAuth, checkout);

module.exports = router;