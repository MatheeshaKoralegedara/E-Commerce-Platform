
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/format';

export default function AdminOverviewPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) load();
  }, [token]);

  async function load() {
    setLoading(true);
    try {
      const result = await apiRequest('/analytics/overview', { token });
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="text-[var(--color-muted)] text-sm">Loading dashboard…</p>;
  if (error) return <p className="text-red-600 text-sm">{error}</p>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Revenue" value={formatPrice(data.totalRevenueCents)} />
        <MetricCard label="Total Orders" value={data.totalOrders} />
        <MetricCard label="Revenue (30d)" value={formatPrice(data.revenue30dCents)} />
        <MetricCard label="Customers" value={data.customerCount} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order status breakdown */}
        <div className="border border-[var(--color-line)] rounded-md p-5">
          <h3 className="font-medium text-sm mb-4">Orders by Status</h3>
          <div className="space-y-2">
            {data.statusBreakdown.map((s) => (
              <div key={s.status} className="flex justify-between text-sm">
                <span className="capitalize text-[var(--color-muted)]">{s.status}</span>
                <span className="font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="border border-[var(--color-line)] rounded-md p-5">
          <h3 className="font-medium text-sm mb-4">Top Products</h3>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No sales yet.</p>
          ) : (
            <div className="space-y-2">
              {data.topProducts.map((p) => (
                <div key={p.product_name} className="flex justify-between text-sm">
                  <span>{p.product_name}</span>
                  <span className="text-[var(--color-muted)]">{p.units_sold} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low stock warning */}
      {data.lowStock.length > 0 && (
        <div className="border border-orange-200 bg-orange-50 rounded-md p-5">
          <h3 className="font-medium text-sm mb-4 text-orange-800">⚠ Low Stock</h3>
          <div className="space-y-2">
            {data.lowStock.map((v) => (
              <div key={v.sku} className="flex justify-between text-sm">
                <span>{v.product_name} ({v.sku})</span>
                <span className="text-orange-700 font-medium">{v.stock_qty} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/admin/products" className="btn-secondary rounded-md px-4 py-2 text-sm">Manage Products</Link>
        <Link href="/admin/orders" className="btn-secondary rounded-md px-4 py-2 text-sm">Manage Orders</Link>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="border border-[var(--color-line)] rounded-md p-4">
      <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide mb-1">{label}</p>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}