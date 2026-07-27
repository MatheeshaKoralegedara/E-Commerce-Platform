const stripe = require('../config/stripe');
const { query } = require('../config/db');
const { markPaymentStatus } = require('../models/paymentModel');

async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body must be the RAW request body here, not JSON-parsed
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    req.log.error({ err }, 'Webhook signature verification failed');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  
if (event.type === 'payment_intent.succeeded') {
  const paymentIntent = event.data.object;
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    req.log.warn({ paymentIntentId: paymentIntent.id }, 'payment_intent.succeeded received with no orderId in metadata — ignoring');
    return res.json({ received: true });
  }

  await markPaymentStatus(paymentIntent.id, 'succeeded');
  const result = await query(`UPDATE orders SET status = 'paid' WHERE id = $1 RETURNING *`, [orderId]);

  if (result.rows.length === 0) {
    req.log.warn({ orderId }, 'payment_intent.succeeded for order — no matching order found');
  } else {
    req.log.info({ orderId }, 'Order marked as paid');
  }
}

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    await markPaymentStatus(paymentIntent.id, 'failed');
  }

  res.json({ received: true });
}

module.exports = { handleStripeWebhook };