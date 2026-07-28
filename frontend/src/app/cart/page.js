
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/format';

export default function CartPage() {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    
    loadCart();
  }, [authLoading]);

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
      loadCart();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeItem(variantId) {
    try {
      await apiRequest('/cart/items', {
        method: 'PATCH',
        body: { variantId, quantity: 0 },
        token,
      });
      loadCart();
    } catch (err) {
      setError(err.message);
    }
  }

  if (authLoading || loading) {
    return <main className="max-w-3xl mx-auto px-6 py-16 text-center text-[var(--color-muted)]">Loading cart…</main>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="font-display text-2xl mb-2">Your cart is empty</p>
        <p className="text-[var(--color-muted)] mb-6">Nothing here yet — go find something you like.</p>
        <Link href="/" className="btn-primary rounded-full px-5 py-2 text-sm inline-block">Continue shopping</Link>
      </main>
    );
  }

  async function removeItem(variantId) {
  try {
    await apiRequest('/cart/items', {
      method: 'PATCH',
      body: { variantId, quantity: 0 },
      token,
    });
    loadCart();
  } catch (err) {
    setError(err.message);
  }
}


  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <p className="eyebrow mb-2">Your Cart</p>
      <h1 className="font-display text-3xl mb-8">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
        {cart.items.map((item) => (
          <div key={item.variant_id} className="py-5 flex justify-between items-center">
            <div>
              <p className="font-medium">{item.product_name}</p>
              <p className="text-sm text-[var(--color-muted)] mt-0.5">
                {Object.entries(item.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(', ') || item.sku}
              </p>
              <p className="text-sm text-[var(--color-muted)]">{formatPrice(item.price_cents)} each</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[var(--color-line)] rounded-full">
                  <button
                    onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-line)]/40 rounded-full transition-colors"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock_qty}
                    className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-line)]/40 rounded-full transition-colors disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.variant_id)}
                  className="text-xs text-red-600 underline underline-offset-2"
                  aria-label={`Remove ${item.product_name} from cart`}
                >
                  Remove
                </button>
              </div>

              <p className="font-medium w-24 text-right">
                {formatPrice(item.price_cents * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <p className="text-lg">
          Subtotal: <span className="font-display text-xl ml-1">{formatPrice(cart.subtotalCents)}</span>
        </p>
        <Link href="/checkout" className="btn-primary rounded-full px-6 py-3 text-sm">
          Proceed to Checkout
        </Link>
      </div>
    </main>
  );
}