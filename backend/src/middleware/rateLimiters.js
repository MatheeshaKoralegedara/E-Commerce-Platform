// backend/src/middleware/rateLimiters.js
const rateLimit = require('express-rate-limit');

// Checkout: financial action, should be rare per user — tight limit
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many checkout attempts. Please wait a few minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Cart: normal browsing/shopping behavior, but still cap to prevent abuse
const cartLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Discount validation: this is the one most at risk of being brute-forced
// to guess valid codes — tightest limit of the three
const discountLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15,
  message: { error: 'Too many discount code attempts. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { checkoutLimiter, cartLimiter, discountLimiter };
