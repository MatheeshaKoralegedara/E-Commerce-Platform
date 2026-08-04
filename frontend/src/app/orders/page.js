'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/format';
import Badge, { ORDER_STATUS_TONE } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';

export default function MyOrdersPage() {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    loadOrders();
  }, [authLoading, user]);

  if (authLoading || loading) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-3">
          <div className="skeleton h-8 w-40 rounded mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-lg"></div>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return <main className="max-w-3xl mx-auto px-6 py-16"><Alert>{error}</Alert></main>;
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <p className="eyebrow mb-2">Account</p>
      <h1 className="font-display text-3xl mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No orders yet"
          description="You haven't placed any orders yet."
          action={<Button href="/" shape="full">Start shopping</Button>}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="card-product rounded-lg p-4 sm:p-5 flex flex-wrap gap-3 justify-between items-center block"
            >
              <div className="min-w-0">
                <p className="font-medium">Order #{order.id}</p>
                <p className="text-sm text-[var(--color-muted)] mt-0.5">
                  {new Date(order.created_at).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-medium mb-1.5">{formatPrice(order.total_cents)}</p>
                <Badge tone={ORDER_STATUS_TONE[order.status] || 'neutral'}>{order.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
