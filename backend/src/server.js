require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const discountRoutes = require('./routes/discountRoutes');

const app = express();

app.use(helmet());
app.use(cors());

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

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));