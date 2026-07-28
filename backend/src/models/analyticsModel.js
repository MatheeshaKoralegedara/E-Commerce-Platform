
const { query } = require('../config/db');

async function getRevenueSummary() {
  const result = await query(
    `SELECT
       COALESCE(SUM(total_cents), 0) AS total_revenue_cents,
       COUNT(*) AS total_orders
     FROM orders
     WHERE status IN ('paid', 'shipped', 'delivered')`
  );
  return result.rows[0];
}

async function getRevenueLast30Days() {
  const result = await query(
    `SELECT
       COALESCE(SUM(total_cents), 0) AS revenue_cents,
       COUNT(*) AS order_count
     FROM orders
     WHERE status IN ('paid', 'shipped', 'delivered')
       AND created_at >= now() - interval '30 days'`
  );
  return result.rows[0];
}

async function getOrderStatusBreakdown() {
  const result = await query(
    `SELECT status, COUNT(*) AS count
     FROM orders
     GROUP BY status
     ORDER BY count DESC`
  );
  return result.rows;
}

async function getTopProducts(limit = 5) {
  const result = await query(
    `SELECT oi.product_name, SUM(oi.quantity) AS units_sold,
            SUM(oi.unit_price_cents * oi.quantity) AS revenue_cents
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.status IN ('paid', 'shipped', 'delivered')
     GROUP BY oi.product_name
     ORDER BY units_sold DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

async function getLowStockVariants(threshold = 10) {
  const result = await query(
    `SELECT p.name AS product_name, v.sku, v.stock_qty
     FROM product_variants v
     JOIN products p ON p.id = v.product_id
     WHERE v.stock_qty <= $1
     ORDER BY v.stock_qty ASC`,
    [threshold]
  );
  return result.rows;
}

async function getCustomerCount() {
  const result = await query(`SELECT COUNT(*) AS count FROM users WHERE role = 'customer'`);
  return parseInt(result.rows[0].count);
}

module.exports = {
  getRevenueSummary,
  getRevenueLast30Days,
  getOrderStatusBreakdown,
  getTopProducts,
  getLowStockVariants,
  getCustomerCount,
};