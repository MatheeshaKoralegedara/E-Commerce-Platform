const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const { cartLimiter } = require('../middleware/rateLimiters');
const { viewCart, addToCart, updateCartItem } = require('../controllers/cartController');

const router = express.Router();

router.get('/', cartLimiter, optionalAuth, viewCart);
router.post('/items', cartLimiter, optionalAuth, addToCart);
router.patch('/items', cartLimiter, optionalAuth, updateCartItem);

module.exports = router;