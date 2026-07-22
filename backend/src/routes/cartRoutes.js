const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { viewCart, addToCart,updateCartItem } = require('../controllers/cartController');

const router = express.Router();

router.get('/', requireAuth, viewCart);
router.post('/items', requireAuth, addToCart);
router.patch('/items', requireAuth, updateCartItem);

module.exports = router;