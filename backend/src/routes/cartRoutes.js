const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const { viewCart, addToCart, updateCartItem } = require('../controllers/cartController');

const router = express.Router();

router.get('/', optionalAuth, viewCart);
router.post('/items', optionalAuth, addToCart);
router.patch('/items', optionalAuth, updateCartItem);

module.exports = router;