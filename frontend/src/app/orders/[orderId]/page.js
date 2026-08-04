// frontend/src/app/orders/[orderId]/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/format';
import Alert from '@/components/ui/Alert';
import OrderStatusTracker from '@/components/OrderStatusTracker';

export default function OrderDetailPage({ params }) {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    load();
  }, [authLoading, user]);

  if (authLoading || loading) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="skeleton h-8 w-40 rounded mb-6"></div>
        <div className="skeleton h-40 rounded-lg"></div>
      </main>
    );
  }
  if (error) return <main className="max-w-2xl mx-auto px-6 py-12"><Alert>{error}</Alert></main>;
  if (!order) return <main className="max-w-2xl mx-auto px-6 py-12 text-[var(--color-muted)]">Order not found.</main>;

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/orders" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors inline-flex items-center gap-1 mb-4">
        ← Back to orders
      </Link>
      <h1 className="font-display text-3xl mb-6">Order #{order.id}</h1>

      <div className="border border-[var(--color-line)] rounded-md px-4 mb-8">
        <OrderStatusTracker status={order.status} />
      </div>

      <div className="border border-[var(--color-line)] rounded-md p-4 mb-6">
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide mb-2">Shipping to</p>
          <p className="text-sm font-medium">{order.shipping_name}</p>
          <p className="text-sm">{order.shipping_phone}</p>
          <p className="text-sm">{order.shipping_address_line1}</p>
          <p className="text-sm">{order.shipping_city}{order.shipping_postal_code ? `, ${order.shipping_postal_code}` : ''}</p>
        {order.shipping_country && <p className="text-sm">{order.shipping_country}</p>}
      </div>

      <div className="card rounded-lg divide-y divide-[var(--color-line)]">
        {order.items.map((item) => (
          <div key={item.id} className="p-4 flex justify-between">
            <div>
              <p className="font-medium">{item.product_name}</p>
              <p className="text-sm text-[var(--color-muted)]">Qty: {item.quantity}</p>
            </div>
            <p className="font-medium">
              {formatPrice(item.unit_price_cents * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 card rounded-lg p-5 space-y-1 text-right ml-auto">
        <p className="text-sm text-[var(--color-muted)]">Subtotal: {formatPrice(order.subtotal_cents)}</p>
        {order.discount_cents > 0 && (
          <p className="text-sm text-[var(--color-pine)]">Discount: −{formatPrice(order.discount_cents)}</p>
        )}
        <p className="font-display text-xl pt-1">Total: {formatPrice(order.total_cents)}</p>
      </div>
    </main>
  );
}
