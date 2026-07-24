
const { query } = require('../config/db');

async function createDiscountCode({ code, type, value, minOrderCents, usageLimit, expiresAt }) {
  const result = await query(
    `INSERT INTO discount_codes (code, type, value, min_order_cents, usage_limit, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [code.toUpperCase(), type, value, minOrderCents || 0, usageLimit || null, expiresAt || null]
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

async function validateDiscountCode(code, subtotalCents) {
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

  const discountCents = calculateDiscount(discountCode, subtotalCents);
  return { valid: true, discountCode, discountCents };
}

module.exports = {
  createDiscountCode,
  getActiveCodeByCode,
  listAllCodes,
  deactivateCode,
  validateDiscountCode,
};


