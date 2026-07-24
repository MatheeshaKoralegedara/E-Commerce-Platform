const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { createPaymentIntent } = require('../controllers/paymentController');

const router = express.Router();
router.post('/create-intent', requireAuth, createPaymentIntent);

module.exports = router;
