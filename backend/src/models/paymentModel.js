const { query } = require('../config/db');

async function createPaymentRecord(orderId, providerPaymentId, amountCents) {
  const result = await query(
    `INSERT INTO payments (order_id, provider_payment_id, amount_cents, status)
     VALUES ($1, $2, $3, 'pending')
     RETURNING *`,
    [orderId, providerPaymentId, amountCents]
  );
  return result.rows[0];
}

async function markPaymentStatus(providerPaymentId, status) {
  const result = await query(
    `UPDATE payments SET status = $1 WHERE provider_payment_id = $2 RETURNING *`,
    [status, providerPaymentId]
  );
  return result.rows[0];
}

async function getPaymentByProviderId(providerPaymentId) {
  const result = await query(`SELECT * FROM payments WHERE provider_payment_id = $1`, [providerPaymentId]);
  return result.rows[0];
}

module.exports = { createPaymentRecord, markPaymentStatus, getPaymentByProviderId };