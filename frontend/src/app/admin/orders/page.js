'use client';

import { useEffect, useState } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/format';

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) loadOrders();
  }, [token, statusFilter]);

  async function loadOrders() {
    setLoading(true);
    try {
      const url = statusFilter ? `/orders/admin/all?status=${statusFilter}` : '/orders/admin/all';
      const data = await apiRequest(url, { token });
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId, newStatus) {
    try {
      await apiRequest(`/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
        token,
      });
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl mb-6">Orders</h2>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="mb-5">
        <label className="text-sm font-medium mr-2">Filter by status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[var(--color-line)] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-[var(--color-muted)] text-sm">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-[var(--color-muted)] text-sm">No orders found.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-muted)] text-xs uppercase tracking-wide">
              <th className="py-2 font-medium">Order #</th>
              <th className="py-2 font-medium">User ID</th>
              <th className="py-2 font-medium">Total</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Date</th>
              <th className="py-2 font-medium">Update Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[var(--color-line)]">
                <td className="py-3">#{order.id}</td>
                <td className="py-3">{order.user_id}</td>
                <td className="py-3">{formatPrice(order.total_cents)}</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-line)]/60 text-[var(--color-ink)]">
                    {order.status}
                  </span>
                </td>
                <td className="py-3 text-[var(--color-muted)]">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="py-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="border border-[var(--color-line)] rounded-md px-2 py-1 text-xs focus:outline-none focus:border-[var(--color-ink)]"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}