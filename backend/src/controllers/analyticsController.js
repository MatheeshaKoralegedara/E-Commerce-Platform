
const {
  getRevenueSummary, getRevenueLast30Days, getOrderStatusBreakdown,
  getTopProducts, getLowStockVariants, getCustomerCount,
} = require('../models/analyticsModel');

async function getOverview(req, res) {
  try {
    const [revenue, revenue30d, statusBreakdown, topProducts, lowStock, customerCount] = await Promise.all([
      getRevenueSummary(),
      getRevenueLast30Days(),
      getOrderStatusBreakdown(),
      getTopProducts(5),
      getLowStockVariants(10),
      getCustomerCount(),
    ]);

    res.json({
      totalRevenueCents: parseInt(revenue.total_revenue_cents),
      totalOrders: parseInt(revenue.total_orders),
      revenue30dCents: parseInt(revenue30d.revenue_cents),
      orders30d: parseInt(revenue30d.order_count),
      statusBreakdown,
      topProducts,
      lowStock,
      customerCount,
    });
  } catch (err) {
    req.log.error({ err }, 'Failed to fetch analytics overview');
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

module.exports = { getOverview };