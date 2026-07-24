'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/format';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-[var(--color-pine)]/10 text-[var(--color-pine)]',
  cancelled: 'bg-red-100 text-red-800',
};

export default function MyOrdersPage() {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    loadOrders();
  }, [authLoading, user]);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await apiRequest('/orders/my', { token });
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return <main className="max-w-3xl mx-auto px-6 py-16 text-center text-[var(--color-muted)]">Loading your orders…</main>;
  }

  if (error) {
    return <main className="max-w-3xl mx-auto px-6 py-16 text-red-600 text-sm">{error}</main>;
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <p className="eyebrow mb-2">Account</p>
      <h1 className="font-display text-3xl mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div>
          <p className="text-[var(--color-muted)] mb-4">You haven't placed any orders yet.</p>
          <Link href="/" className="btn-primary rounded-full px-5 py-2 text-sm inline-block">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="card-product rounded-md p-5 flex justify-between items-center block"
            >
              <div>
                <p className="font-medium">Order #{order.id}</p>
                <p className="text-sm text-[var(--color-muted)] mt-0.5">
                  {new Date(order.created_at).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(order.total_cents)}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-800'}`}>
                  {order.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}