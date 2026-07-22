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
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  
if (event.type === 'payment_intent.succeeded') {
  const paymentIntent = event.data.object;
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    console.warn(`payment_intent.succeeded received with no orderId in metadata (id: ${paymentIntent.id}) — ignoring`);
    return res.json({ received: true });
  }

  await markPaymentStatus(paymentIntent.id, 'succeeded');
  const result = await query(`UPDATE orders SET status = 'paid' WHERE id = $1 RETURNING *`, [orderId]);

  if (result.rows.length === 0) {
    console.warn(`payment_intent.succeeded for orderId ${orderId} — no matching order found`);
  } else {
    console.log(`Order ${orderId} marked as paid`);
  }
}

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    await markPaymentStatus(paymentIntent.id, 'failed');
  }

  res.json({ received: true });
}

module.exports = { handleStripeWebhook };