const stripe = require('../config/stripe');
const logger = require('../config/logger');
const { query } = require('../config/db');
const { markPaymentStatus } = require('../models/paymentModel');



async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error({ err }, 'Webhook signature verification failed');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
      logger.warn({ paymentIntentId: paymentIntent.id }, 'payment_intent.succeeded with no orderId in metadata');
      return res.json({ received: true });
    }

    await markPaymentStatus(paymentIntent.id, 'succeeded');
    const result = await query(`UPDATE orders SET status = 'paid' WHERE id = $1 RETURNING *`, [orderId]);
    logger.info({ orderId, matched: result.rows.length > 0 }, 'Order marked as paid');
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    await markPaymentStatus(paymentIntent.id, 'failed');
  }

  // New: handle refunds
  if (event.type === 'charge.refunded') {
    const charge = event.data.object;
    const paymentIntentId = charge.payment_intent;

    await markPaymentStatus(paymentIntentId, 'refunded');
    await query(
      `UPDATE orders SET status = 'refunded'
       WHERE id = (SELECT order_id FROM payments WHERE provider_payment_id = $1)`,
      [paymentIntentId]
    );
    logger.info({ paymentIntentId }, 'Order marked as refunded');
  }

  // New: handle disputes/chargebacks
  if (event.type === 'charge.dispute.created') {
    const dispute = event.data.object;
    const paymentIntentId = dispute.payment_intent;

    await query(
      `UPDATE orders SET status = 'disputed'
       WHERE id = (SELECT order_id FROM payments WHERE provider_payment_id = $1)`,
      [paymentIntentId]
    );
    logger.warn({ paymentIntentId, disputeId: dispute.id }, 'Order marked as disputed — chargeback filed');
  }

  res.json({ received: true });
}

module.exports = { handleStripeWebhook };