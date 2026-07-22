
const { getOrCreateCart } = require('../models/cartModel');
const { createOrderFromCart } = require('../models/orderModel');

async function checkout(req, res) {
  try {
    const cart = await getOrCreateCart(req.user.userId);
    const order = await createOrderFromCart(req.user.userId, cart.id);
    res.status(201).json(order);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Checkout failed' });
  }
}

module.exports = { checkout };