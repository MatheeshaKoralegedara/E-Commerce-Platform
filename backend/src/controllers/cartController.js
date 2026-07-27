const { getOrCreateCart, addItem, updateItemQuantity, getCartWithItems } = require('../models/cartModel');
const { query } = require('../config/db');

async function viewCart(req, res) {
    try{
        const cart = await getOrCreateCart(req.user.userId);
        const items = await getCartWithItems(cart.id);
        const subtotalCents = items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
        res.json({ cartId: cart.id, items, subtotalCents });
    } catch (err) {
        req.log.error(err);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
}

async function addToCart(req, res) {
  try {
    const { variantId, quantity } = req.body;
    if (!variantId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid variantId and quantity required' });
    }

    const variantCheck = await query('SELECT id, stock_qty FROM product_variants WHERE id = $1', [variantId]);
    if (!variantCheck.rows[0]) {
      return res.status(404).json({ error: 'Product variant not found' });
    }

    // New: reject adding more than what's currently in stock
    if (quantity > variantCheck.rows[0].stock_qty) {
      return res.status(409).json({ error: `Only ${variantCheck.rows[0].stock_qty} in stock` });
    }

    const cart = await getOrCreateCart(req.user.userId);
    const item = await addItem(cart.id, variantId, quantity);
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
}
async function updateCartItem(req, res) {
    try{
        const { variantId, quantity } = req.body;
        const cart = await getOrCreateCart(req.user.userId);
        const item = await updateItemQuantity(cart.id, variantId, quantity);
        res.json(item);
    } catch (err){
        req.log.error(err);
        res.status(500).json({ error: 'Failed to update cart' });
    }
}

module.exports = { viewCart, addToCart, updateCartItem };
