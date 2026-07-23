
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import CheckoutForm from '@/components/CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState(null);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const hasStarted = useRef(false); // prevents double-firing in React Strict Mode dev

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (hasStarted.current) return; // already started (or starting) — don't run again
    hasStarted.current = true;
    startCheckout();
  }, [authLoading, user]);

  async function startCheckout() {
    try {
      const newOrder = await apiRequest('/orders/checkout', { method: 'POST', token });
      setOrder(newOrder);

      const intentData = await apiRequest('/payments/create-intent', {
        method: 'POST',
        body: { orderId: newOrder.id },
        token,
      });
      setClientSecret(intentData.clientSecret);
    } catch (err) {
      setError(err.message);
    }
  }

 

  if (authLoading) return <main className="max-w-lg mx-auto px-4 py-8">Loading...</main>;

  if (error) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!clientSecret || !order) {
    return <main className="max-w-lg mx-auto px-4 py-8">Preparing your order...</main>;
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Checkout</h1>
      <p className="text-gray-600 mb-6">
        Order #{order.id} — Total: ${(order.total_cents / 100).toFixed(2)}
      </p>

      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm orderId={order.id} />
      </Elements>
    </main>
  );
}