
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

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

  if (loading) return <main className="max-w-lg mx-auto px-4 py-8">Loading order...</main>;
  if (!order) return <main className="max-w-lg mx-auto px-4 py-8">Order not found.</main>;

  return (
    <main className="max-w-lg mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-2">
        {order.status === 'paid' ? 'Payment Successful!' : 'Order Received'}
      </h1>
      <p className="text-gray-600 mb-6">Order #{order.id} — Status: {order.status}</p>
      <p className="text-lg font-bold mb-6">Total: ${(order.total_cents / 100).toFixed(2)}</p>
      <Link href="/" className="text-blue-600 underline">Continue shopping</Link>
    </main>
  );
}