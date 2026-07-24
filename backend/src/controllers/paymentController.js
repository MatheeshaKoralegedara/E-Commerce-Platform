const stripe = require('../config/stripe');
const { query } = require('../config/db');
const { createPaymentRecord } = require('../models/paymentModel');

async function createPaymentIntent(req, res) {
  try {
    const { orderId } = req.body;

    const orderResult = await query(`SELECT * FROM orders WHERE id = $1 AND user_id = $2`, [
      orderId,
      req.user.userId, // ensure users can only pay for their own orders
    ]);
    const order = orderResult.rows[0];

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.status !== 'pending') {
      return res.status(409).json({ error: `Order is already ${order.status}` });
    }

    
    const paymentIntent = await stripe.paymentIntents.create({
         amount: Math.round(order.total_cents * 100),
         currency: 'lkr',
         automatic_payment_methods: {
         enabled: true,
        allow_redirects: 'never', // avoids needing a return_url; card payments still work fine
        },
    metadata: { orderId: String(order.id) },
});

    await createPaymentRecord(order.id, paymentIntent.id, order.total_cents);

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
}

module.exports = { createPaymentIntent };