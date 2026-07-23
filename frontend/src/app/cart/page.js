
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function CartPage() {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return; // wait for auth state to resolve first
    if (!user) {
      router.push('/login');
      return;
    }
    loadCart();
  }, [authLoading, user]);

  async function loadCart() {
    setLoading(true);
    try {
      const data = await apiRequest('/cart', { token });
      setCart(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(variantId, newQuantity) {
    try {
      await apiRequest('/cart/items', {
        method: 'PATCH',
        body: { variantId, quantity: newQuantity },
        token,
      });
      loadCart(); // refresh cart after change
    } catch (err) {
      setError(err.message);
    }
  }

  if (authLoading || loading) {
    return <main className="max-w-3xl mx-auto px-4 py-8">Loading cart...</main>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-500">Your cart is empty.</p>
        <Link href="/" className="text-blue-600 underline mt-2 inline-block">
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="space-y-4">
        {cart.items.map((item) => (
          <div key={item.variant_id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{item.product_name}</p>
              <p className="text-sm text-gray-500">
                {Object.entries(item.attributes || {})
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(', ') || item.sku}
              </p>
              <p className="text-sm text-gray-500">${(item.price_cents / 100).toFixed(2)} each</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded">
                <button
                  onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                  className="px-3 py-1"
                >
                  −
                </button>
                <span className="px-3">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock_qty}
                  className="px-3 py-1 disabled:opacity-40"
                >
                  +
                </button>
              </div>
              <p className="font-bold w-20 text-right">
                ${((item.price_cents * item.quantity) / 100).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center border-t pt-4">
        <p className="text-xl font-bold">
          Subtotal: ${(cart.subtotalCents / 100).toFixed(2)}
        </p>
        <Link
          href="/checkout"
          className="bg-black text-white px-6 py-3 rounded font-medium"
        >
          Proceed to Checkout
        </Link>
      </div>
    </main>
  );
}