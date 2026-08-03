require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');
const { randomUUID } = require('crypto');
const logger = require('./config/logger');
const { pool } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const discountRoutes = require('./routes/discountRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes')
const adminReviewRoutes = require('./routes/adminReviewRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1); // trust Render's reverse proxy for accurate client IPs in rate limiting

app.use(helmet());
const corsOptions = {
  origin: [
    'https://mercato-e-commerce-platform.vercel.app',
    'http://localhost:3000',
  ],
};
app.use(cors(corsOptions));

app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const existingId = req.headers['x-request-id'];
      const id = existingId || randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },
  })
);

// IMPORTANT: webhook route must be registered BEFORE express.json(),
// because it needs the raw body — express.json() would consume/parse it first otherwise
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products/:productId/reviews', reviewRoutes);
app.use('/api/discounts',discountRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);
app.use('/api/audit-log', auditLogRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch (err) {
    logger.error({ err }, 'Health check failed: database unreachable');
    res.status(503).json({ ok: false, database: 'unreachable' });
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));