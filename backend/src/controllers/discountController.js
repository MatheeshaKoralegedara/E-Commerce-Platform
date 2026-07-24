
const { createDiscountCode, listAllCodes, deactivateCode, validateDiscountCode } = require('../models/discountModel');

// Public-ish (requires login): preview a code against the current cart, without committing to checkout
async function validate(req, res) {
  try {
    const { code, subtotalCents } = req.body;
    if (!code || subtotalCents == null) {
      return res.status(400).json({ error: 'code and subtotalCents are required' });
    }
    const result = await validateDiscountCode(code, subtotalCents);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to validate discount code' });
  }
}

// Admin: create a new code
async function create(req, res) {
  try {
    const { code, type, value, minOrderCents, usageLimit, expiresAt } = req.body;
    if (!code || !type || !value) {
      return res.status(400).json({ error: 'code, type, and value are required' });
    }
    if (!['percentage', 'fixed'].includes(type)) {
      return res.status(400).json({ error: 'type must be "percentage" or "fixed"' });
    }
    const discountCode = await createDiscountCode({ code, type, value, minOrderCents, usageLimit, expiresAt });
    res.status(201).json(discountCode);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'This code already exists' });
    }
    res.status(500).json({ error: 'Failed to create discount code' });
  }
}

// Admin: list all codes
async function list(req, res) {
  try {
    const codes = await listAllCodes();
    res.json(codes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list discount codes' });
  }
}

// Admin: deactivate a code
async function remove(req, res) {
  try {
    const code = await deactivateCode(req.params.id);
    if (!code) return res.status(404).json({ error: 'Discount code not found' });
    res.json(code);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to deactivate discount code' });
  }
}

module.exports = { validate, create, list, remove };