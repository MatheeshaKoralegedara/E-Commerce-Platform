require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');
const { randomUUID } = require('crypto');
const logger = require('./config/logger');
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

const app = express();

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

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));