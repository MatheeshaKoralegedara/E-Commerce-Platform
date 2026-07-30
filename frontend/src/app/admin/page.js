
'use client';

import { useEffect, useState } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/format';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-lg"></div>)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="skeleton h-40 rounded-lg"></div>
          <div className="skeleton h-40 rounded-lg"></div>
        </div>
      </div>
    );
  }
  if (error) return <Alert>{error}</Alert>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Revenue" value={formatPrice(data.totalRevenueCents)} icon="💰" />
        <MetricCard label="Total Orders" value={data.totalOrders} icon="📦" />
        <MetricCard label="Revenue (30d)" value={formatPrice(data.revenue30dCents)} icon="📈" />
        <MetricCard label="Customers" value={data.customerCount} icon="👤" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card rounded-lg p-5">
          <h3 className="font-medium text-sm mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {data.statusBreakdown.map((s) => {
              const max = Math.max(...data.statusBreakdown.map((x) => x.count), 1);
              return (
                <div key={s.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-[var(--color-muted)]">{s.status}</span>
                    <span className="font-medium">{s.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--color-line)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(s.count / max) * 100}%`, background: 'var(--color-clay)' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card rounded-lg p-5">
          <h3 className="font-medium text-sm mb-4">Top Products</h3>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p.product_name} className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[var(--color-pine-light)] text-[var(--color-pine-dark)] text-xs flex items-center justify-center font-medium">{i + 1}</span>
                    {p.product_name}
                  </span>
                  <span className="text-[var(--color-muted)]">{p.units_sold} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {data.lowStock.length > 0 && (
        <div className="rounded-lg p-5" style={{ background: 'var(--color-warning-light)', border: '1px solid rgba(184,133,62,0.25)' }}>
          <h3 className="font-medium text-sm mb-4 flex items-center gap-1.5" style={{ color: 'var(--color-warning)' }}>
            <span aria-hidden="true">!</span> Low Stock
          </h3>
          <div className="space-y-2">
            {data.lowStock.map((v) => (
              <div key={v.sku} className="flex justify-between text-sm">
                <span>{v.product_name} ({v.sku})</span>
                <span className="font-medium" style={{ color: 'var(--color-warning)' }}>{v.stock_qty} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button href="/admin/products" variant="secondary">Manage Products</Button>
        <Button href="/admin/orders" variant="secondary">Manage Orders</Button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }) {
  return (
    <div className="card rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide">{label}</p>
        <span className="text-base opacity-70">{icon}</span>
      </div>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}
