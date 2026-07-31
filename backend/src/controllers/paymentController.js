const stripe = require('../config/stripe');
const { query } = require('../config/db');
const { createPaymentRecord } = require('../models/paymentModel');

async function createPaymentIntent(req, res) {
  try {
    const { orderId } = req.body;

    const orderResult = await query(`SELECT * FROM orders WHERE id = $1 AND user_id = $2`, [
      orderId,
      req.user.userId,
    ]);
    const order = orderResult.rows[0];

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.status !== 'pending') {
      return res.status(409).json({ error: `Order is already ${order.status}` });
    }

    // Stable key tied to this specific order — if Stripe sees this exact key again
    // within 24 hours, it returns the original PaymentIntent instead of creating a new one.
    const idempotencyKey = `order-${order.id}-payment-intent`;

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: order.total_cents,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        metadata: { orderId: String(order.id) },
      },
      { idempotencyKey }
    );

    // If this order already has a payment record (e.g., a retried request), don't insert a duplicate
    const existingPayment = await query(
      `SELECT * FROM payments WHERE provider_payment_id = $1`,
      [paymentIntent.id]
    );
    if (existingPayment.rows.length === 0) {
      await createPaymentRecord(order.id, paymentIntent.id, order.total_cents);
    }

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    req.log.error({ err }, 'Failed to create payment intent');
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
}

module.exports = { createPaymentIntent };