
const { query } = require('../config/db');

async function createDiscountCode({ code, type, value, minOrderCents, usageLimit, perUserLimit, expiresAt }) {
  const result = await query(
    `INSERT INTO discount_codes (code, type, value, min_order_cents, usage_limit, per_user_limit, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [code.toUpperCase(), type, value, minOrderCents || 0, usageLimit || null, perUserLimit || null, expiresAt || null]
  );
  return result.rows[0];
}

async function getActiveCodeByCode(code) {
  const result = await query(
    `SELECT * FROM discount_codes WHERE code = $1 AND active = true`,
    [code.toUpperCase()]
  );
  return result.rows[0];
}

async function listAllCodes() {
  const result = await query(`SELECT * FROM discount_codes ORDER BY created_at DESC`);
  return result.rows;
}

async function deactivateCode(id) {
  const result = await query(
    `UPDATE discount_codes SET active = false WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}


function calculateDiscount(discountCode, subtotalCents) {
  if (discountCode.type === 'percentage') {
    return Math.round(subtotalCents * (discountCode.value / 100));
  }
  // 'fixed' — cap it so discount can never exceed the subtotal (no negative totals)
  return Math.min(discountCode.value, subtotalCents);
}

async function getUserUsageCount(discountCodeId, userId) {
  const result = await query(
    `SELECT COUNT(*) AS count FROM discount_code_usage WHERE discount_code_id = $1 AND user_id = $2`,
    [discountCodeId, userId]
  );
  return parseInt(result.rows[0].count);
}

async function recordUsage(discountCodeId, userId, orderId) {
  await query(
    `INSERT INTO discount_code_usage (discount_code_id, user_id, order_id) VALUES ($1, $2, $3)`,
    [discountCodeId, userId, orderId]
  );
}

async function validateDiscountCode(code, subtotalCents, userId = null) {
  const discountCode = await getActiveCodeByCode(code);

  if (!discountCode) {
    return { valid: false, error: 'Invalid discount code' };
  }
  if (discountCode.expires_at && new Date(discountCode.expires_at) < new Date()) {
    return { valid: false, error: 'This discount code has expired' };
  }
  if (discountCode.usage_limit !== null && discountCode.times_used >= discountCode.usage_limit) {
    return { valid: false, error: 'This discount code has reached its usage limit' };
  }
  if (subtotalCents < discountCode.min_order_cents) {
    return {
      valid: false,
      error: `Minimum order of $${(discountCode.min_order_cents / 100).toFixed(2)} required for this code`,
    };
  }
  if (userId && discountCode.per_user_limit !== null) {
    const userUsage = await getUserUsageCount(discountCode.id, userId);
    if (userUsage >= discountCode.per_user_limit) {
      return { valid: false, error: 'You have already used this discount code the maximum number of times' };
    }
  }

  const discountCents = calculateDiscount(discountCode, subtotalCents);
  return { valid: true, discountCode, discountCents };
}

async function updateDiscountCode(id, { type, value, minOrderCents, usageLimit, expiresAt, active }) {
  const result = await query(
    `UPDATE discount_codes
     SET type = $1, value = $2, min_order_cents = $3, usage_limit = $4, expires_at = $5, active = $6
     WHERE id = $7
     RETURNING *`,
    [type, value, minOrderCents || 0, usageLimit || null, expiresAt || null, active, id]
  );
  return result.rows[0];
}

module.exports = {
  createDiscountCode,
  getActiveCodeByCode,
  listAllCodes,
  deactivateCode,
  validateDiscountCode,
  updateDiscountCode,
  calculateDiscount,
};


