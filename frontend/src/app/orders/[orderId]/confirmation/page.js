'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/format';
import Button from '@/components/ui/Button';
import OrderStatusTracker from '@/components/OrderStatusTracker';

export default function OrderConfirmationPage({ params }) {
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { orderId } = await params;
      try {
        const data = await apiRequest(`/orders/my/${orderId}`, { token });
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  if (loading) return <main className="max-w-lg mx-auto px-6 py-20 text-center text-[var(--color-muted)]">Loading order…</main>;
  if (!order) return <main className="max-w-lg mx-auto px-6 py-20 text-center text-[var(--color-muted)]">Order not found.</main>;

  return (
    <main className="max-w-lg mx-auto px-6 py-20 text-center animate-fade-up">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-pine-light)] flex items-center justify-center text-3xl">
        {order.status === 'paid' ? '✓' : '📬'}
      </div>
      <p className="eyebrow mb-2">
        {order.status === 'paid' ? 'Payment Successful' : 'Order Received'}
      </p>
      <h1 className="font-display text-3xl mb-3">Thank you</h1>
      <p className="text-[var(--color-muted)] mb-1">Order #{order.id} · {order.status}</p>
      <p className="font-display text-2xl my-6">{formatPrice(order.total_cents)}</p>
      <div className="border border-[var(--color-line)] rounded-md px-4 my-8">
        <OrderStatusTracker status={order.status} />
      </div>
      <div className="flex justify-center gap-3">
        <Button href="/" shape="full">Continue shopping</Button>
        <Button href={`/orders/${order.id}`} variant="secondary" shape="full">View order</Button>
      </div>
    </main>
  );
}
