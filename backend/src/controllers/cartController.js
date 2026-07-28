const { getOrCreateCart, addItem, updateItemQuantity, getCartWithItems } = require('../models/cartModel');
const { query } = require('../config/db');

function resolveCartIdentity(req) {
  if (req.user) return { userId: req.user.userId };
  const guestToken = req.headers['x-guest-token'];
  if (!guestToken) return null;
  return { guestToken };
}

async function viewCart(req, res) {
  try {
    const identity = resolveCartIdentity(req);
    if (!identity) return res.json({ cartId: null, items: [], subtotalCents: 0 });

    const cart = await getOrCreateCart(identity);
    const items = await getCartWithItems(cart.id);
    const subtotalCents = items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
    res.json({ cartId: cart.id, items, subtotalCents });
  } catch (err) {
    req.log.error({ err }, 'Failed to fetch cart');
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
}

async function addToCart(req, res) {
  try {
    const { variantId, quantity } = req.body;
    if (!variantId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid variantId and quantity required' });
    }

    const identity = resolveCartIdentity(req);
    if (!identity) return res.status(400).json({ error: 'Missing auth token or guest token' });

    const variantCheck = await query('SELECT id, stock_qty FROM product_variants WHERE id = $1', [variantId]);
    if (!variantCheck.rows[0]) {
      return res.status(404).json({ error: 'Product variant not found' });
    }
    if (quantity > variantCheck.rows[0].stock_qty) {
      return res.status(409).json({ error: `Only ${variantCheck.rows[0].stock_qty} in stock` });
    }

    const cart = await getOrCreateCart(identity);
    const item = await addItem(cart.id, variantId, quantity);
    res.status(201).json(item);
  } catch (err) {
    req.log.error({ err }, 'Failed to add item to cart');
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
}

async function updateCartItem(req, res) {
  try {
    const { variantId, quantity } = req.body;
    const identity = resolveCartIdentity(req);
    if (!identity) return res.status(400).json({ error: 'Missing auth token or guest token' });

    const cart = await getOrCreateCart(identity);
    const item = await updateItemQuantity(cart.id, variantId, quantity);
    res.json(item);
  } catch (err) {
    req.log.error({ err }, 'Failed to update cart');
    res.status(500).json({ error: 'Failed to update cart' });
  }
}


module.exports = { viewCart, addToCart, updateCartItem };
