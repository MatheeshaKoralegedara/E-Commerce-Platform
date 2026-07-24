// frontend/src/app/orders/[orderId]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/format';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrderDetailPage({ params }) {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    load();
  }, [authLoading, user]);

  async function load() {
    try {
      const { orderId } = await params;
      const data = await apiRequest(`/orders/my/${orderId}`, { token });
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) return <main className="max-w-2xl mx-auto px-4 py-8">Loading...</main>;
  if (error) return <main className="max-w-2xl mx-auto px-4 py-8 text-red-600">{error}</main>;
  if (!order) return <main className="max-w-2xl mx-auto px-4 py-8">Order not found.</main>;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Order #{order.id}</h1>
      <span className={`inline-block px-2 py-0.5 rounded text-xs mb-6 ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-800'}`}>
        {order.status}
      </span>

      <div className="border rounded-lg divide-y">
        {order.items.map((item) => (
          <div key={item.id} className="p-4 flex justify-between">
            <div>
              <p className="font-medium">{item.product_name}</p>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="font-medium">
              {formatPrice(item.unit_price_cents * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1 text-right">
        <p className="text-sm text-gray-600">Subtotal: {formatPrice(order.subtotal_cents)}</p>
        {order.discount_cents > 0 && (
          <p className="text-sm text-green-600">Discount: −{formatPrice(order.discount_cents)}</p>
        )}
        <p className="font-bold text-lg">Total: {formatPrice(order.total_cents)}</p>
      </div>
    </main>
  );
}