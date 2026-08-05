
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

function getClientIp(req) {
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp) return cfIp;
  return ipKeyGenerator(req.ip);
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