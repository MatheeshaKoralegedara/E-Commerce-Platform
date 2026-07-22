const express = require('express');
const { handleStripeWebhook } = require('../controllers/webhookController');

const router = express.Router();
// raw body parser ONLY for this route — Stripe signature verification needs the untouched raw bytes
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;