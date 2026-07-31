'use client';

import { useEffect, useState } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/format';
import { Select } from '@/components/ui/Field';
import Badge, { ORDER_STATUS_TONE } from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

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

      {error && <Alert className="mb-4">{error}</Alert>}

      <div className="mb-5 max-w-xs">
        <Select label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="skeleton h-48 rounded-lg"></div>
      ) : orders.length === 0 ? (
        <p className="text-[var(--color-muted)] text-sm">No orders found.</p>
      ) : (
        <div className="card rounded-lg overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-muted)] text-xs uppercase tracking-wide">
                <th className="py-3 px-4 font-medium">Order #</th>
                <th className="py-3 px-4 font-medium">User ID</th>
                <th className="py-3 px-4 font-medium">Total</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-canvas)]">
                  <td className="py-3 px-4">#{order.id}</td>
                  <td className="py-3 px-4">{order.user_id}</td>
                  <td className="py-3 px-4">{formatPrice(order.total_cents)}</td>
                  <td className="py-3 px-4">
                    <Badge tone={ORDER_STATUS_TONE[order.status] || 'neutral'}>{order.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-[var(--color-muted)]">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      aria-label={`Update status for order #${order.id}`}
                      className="field-input px-2 py-1 text-xs w-auto"
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
        </div>
      )}
    </div>
  );
}
