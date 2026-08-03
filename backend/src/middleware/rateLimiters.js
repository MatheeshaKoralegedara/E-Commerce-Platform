// backend/src/middleware/rateLimiters.js
const rateLimit = require('express-rate-limit');

function getClientIp(req) {
  // Cloudflare's header is the most reliable source of the real client IP
  // in this deployment's proxy chain (Cloudflare -> Render -> our app)
  return req.headers['cf-connecting-ip'] || req.ip;
}

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: getClientIp,
  message: { error: 'Too many checkout attempts. Please wait a few minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const cartLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  keyGenerator: getClientIp,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const discountLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  keyGenerator: getClientIp,
  message: { error: 'Too many discount code attempts. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { checkoutLimiter, cartLimiter, discountLimiter };