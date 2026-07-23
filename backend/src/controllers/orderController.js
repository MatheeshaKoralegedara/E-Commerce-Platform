
const { getOrCreateCart } = require('../models/cartModel');
const {
  createOrderFromCart,
  getOrdersForUser,
  getOrderWithItems,
  getAllOrders,
  updateOrderStatus,
} = require('../models/orderModel');

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

// Customer: list their own past orders
async function myOrders(req, res) {
  try {
    const orders = await getOrdersForUser(req.user.userId);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

// Customer: view one of their own orders in detail
async function myOrderDetail(req, res) {
  try {
    const order = await getOrderWithItems(req.params.orderId, req.user.userId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

// Admin: list all orders, optional ?status=paid filter
async function adminListOrders(req, res) {
  try {
    const { status } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    const orders = await getAllOrders({ status, limit, offset });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

// Admin: view any order in detail
async function adminOrderDetail(req, res) {
  try {
    const order = await getOrderWithItems(req.params.orderId); // no userId = no restriction
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

// Admin: update order status (e.g., paid -> shipped -> delivered)
const VALID_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

async function adminUpdateStatus(req, res) {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    const order = await updateOrderStatus(req.params.orderId, status);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
}

module.exports = {
  checkout,
  myOrders,
  myOrderDetail,
  adminListOrders,
  adminOrderDetail,
  adminUpdateStatus,
};