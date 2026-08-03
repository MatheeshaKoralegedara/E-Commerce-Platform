'use client';

import { Fragment, useEffect, useState } from 'react';
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
  const [expandedId, setExpandedId] = useState(null);

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
                <th className="py-3 px-4 font-medium">Shipping</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isExpanded = expandedId === order.id;
                return (
                <Fragment key={order.id}>
                  <tr className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-canvas)]">
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
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        aria-expanded={isExpanded}
                        aria-controls={`shipping-${order.id}`}
                        className="text-xs text-[var(--color-pine)] underline underline-offset-2"
                      >
                        {isExpanded ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr id={`shipping-${order.id}`} className="border-b border-[var(--color-line)] last:border-0" style={{ background: 'var(--color-canvas)' }}>
                      <td colSpan={7} className="py-4 px-4">
                        <div className="border border-[var(--color-line)] rounded-md p-4 max-w-sm">
                          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide mb-2">Shipping to</p>
                          <p className="text-sm font-medium">{order.shipping_name}</p>
                          <p className="text-sm">{order.shipping_phone}</p>
                          <p className="text-sm">{order.shipping_address_line1}</p>
                          <p className="text-sm">{order.shipping_city}{order.shipping_postal_code ? `, ${order.shipping_postal_code}` : ''}</p>
                          {order.shipping_country && <p className="text-sm">{order.shipping_country}</p>}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
