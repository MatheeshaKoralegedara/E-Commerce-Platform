
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
  const [cart, setCart] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountStatus, setDiscountStatus] = useState('idle'); // idle | checking | valid | invalid
  const [discountInfo, setDiscountInfo] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [clientSecret, setClientSecret] = useState(null);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const hasStarted = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (hasStarted.current) return;
    hasStarted.current = true;
    loadCartPreview();
  }, [authLoading, user]);

  async function loadCartPreview() {
    try {
      const cartData = await apiRequest('/cart', { token });
      setCart(cartData);
    } catch (err) {
      setError(err.message);
    }
  }

  async function applyDiscountCode() {
    if (!discountCode.trim() || !cart) return;
    setDiscountStatus('checking');
    setDiscountError('');
    try {
      const result = await apiRequest('/discounts/validate', {
        method: 'POST',
        body: { code: discountCode.trim(), subtotalCents: cart.subtotalCents },
        token,
      });
      if (result.valid) {
        setDiscountStatus('valid');
        setDiscountInfo(result);
      } else {
        setDiscountStatus('invalid');
        setDiscountError(result.error);
        setDiscountInfo(null);
      }
    } catch (err) {
      setDiscountStatus('invalid');
      setDiscountError(err.message);
    }
  }

  async function proceedToPayment() {
    setError('');
    try {
      const newOrder = await apiRequest('/orders/checkout', {
        method: 'POST',
        body: { discountCode: discountStatus === 'valid' ? discountCode.trim() : null },
        token,
      });
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

  if (authLoading || !cart) return <main className="max-w-lg mx-auto px-4 py-8">Loading...</main>;

  if (error) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  // Payment step — order created, show Stripe form
  if (clientSecret && order) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Payment</h1>
        <p className="text-gray-600 mb-1">Order #{order.id}</p>
        {order.discount_cents > 0 && (
          <p className="text-green-600 text-sm mb-1">
            Discount applied: −${(order.discount_cents / 100).toFixed(2)}
          </p>
        )}
        <p className="text-gray-600 mb-6">Total: ${(order.total_cents / 100).toFixed(2)}</p>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm orderId={order.id} />
        </Elements>
      </main>
    );
  }

  // Review step — show cart summary + discount input, before creating the order
  const discountPreviewCents = discountStatus === 'valid' ? discountInfo.discountCents : 0;
  const estimatedTotal = cart.subtotalCents - discountPreviewCents;

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="border rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600 mb-2">{cart.items.length} item(s)</p>
        <p>Subtotal: ${(cart.subtotalCents / 100).toFixed(2)}</p>
        {discountStatus === 'valid' && (
          <p className="text-green-600">Discount: −${(discountPreviewCents / 100).toFixed(2)}</p>
        )}
        <p className="font-bold text-lg mt-2">Total: ${(estimatedTotal / 100).toFixed(2)}</p>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium block mb-1">Discount code</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => {
              setDiscountCode(e.target.value);
              setDiscountStatus('idle');
            }}
            placeholder="Enter code"
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button
            onClick={applyDiscountCode}
            disabled={discountStatus === 'checking' || !discountCode.trim()}
            className="bg-gray-200 px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            Apply
          </button>
        </div>
        {discountStatus === 'valid' && (
          <p className="text-green-600 text-sm mt-1">Code applied!</p>
        )}
        {discountStatus === 'invalid' && (
          <p className="text-red-600 text-sm mt-1">{discountError}</p>
        )}
      </div>

      <button
        onClick={proceedToPayment}
        className="w-full bg-black text-white py-3 rounded font-medium"
      >
        Continue to Payment
      </button>
    </main>
  );
}