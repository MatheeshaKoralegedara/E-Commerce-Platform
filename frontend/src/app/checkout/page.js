// frontend/src/app/checkout/page.js
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/format';
import CheckoutForm from '@/components/CheckoutForm';
import { Input } from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountStatus, setDiscountStatus] = useState('idle');
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

  if (authLoading || !cart) {
    return (
      <main className="max-w-lg mx-auto px-6 py-16">
        <div className="animate-pulse space-y-4">
          <div className="skeleton h-8 w-40 rounded"></div>
          <div className="skeleton h-32 rounded-lg"></div>
          <div className="skeleton h-12 rounded-lg"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-lg mx-auto px-6 py-16">
        <h1 className="font-display text-2xl mb-4">Checkout</h1>
        <Alert>{error}</Alert>
      </main>
    );
  }

  if (clientSecret && order) {
    return (
      <main className="max-w-lg mx-auto px-6 py-16">
        <p className="eyebrow mb-2">Payment</p>
        <h1 className="font-display text-2xl mb-1">Order #{order.id}</h1>
        {order.discount_cents > 0 && (
          <p className="text-[var(--color-pine)] text-sm mb-1">
            Discount applied: −{formatPrice(order.discount_cents)}
          </p>
        )}
        <p className="text-[var(--color-muted)] mb-8">Total: <span className="font-medium text-[var(--color-ink)]">{formatPrice(order.total_cents)}</span></p>

        <div className="card rounded-lg p-5">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm orderId={order.id} />
          </Elements>
        </div>
      </main>
    );
  }

  const discountPreviewCents = discountStatus === 'valid' ? discountInfo.discountCents : 0;
  const estimatedTotal = cart.subtotalCents - discountPreviewCents;

  return (
    <main className="max-w-lg mx-auto px-6 py-16">
      <p className="eyebrow mb-2">Checkout</p>
      <h1 className="font-display text-3xl mb-8">Review your order</h1>

      <div className="card rounded-lg p-5 mb-6">
        <p className="text-sm text-[var(--color-muted)] mb-3">{cart.items.length} item(s)</p>
        <div className="flex justify-between text-sm mb-1">
          <span>Subtotal</span>
          <span>{formatPrice(cart.subtotalCents)}</span>
        </div>
        {discountStatus === 'valid' && (
          <div className="flex justify-between text-sm text-[var(--color-pine)] mb-1">
            <span>Discount</span>
            <span>−{formatPrice(discountPreviewCents)}</span>
          </div>
        )}
        <div className="flex justify-between font-medium text-lg mt-3 pt-3 border-t border-[var(--color-line)]">
          <span>Total</span>
          <span className="font-display">{formatPrice(estimatedTotal)}</span>
        </div>
      </div>

      <div className="mb-8">
        <label htmlFor="discount-code" className="text-sm font-medium block mb-2">Discount code</label>
        <div className="flex gap-2">
          <Input
            id="discount-code"
            type="text"
            value={discountCode}
            onChange={(e) => {
              setDiscountCode(e.target.value);
              setDiscountStatus('idle');
            }}
            placeholder="Enter code"
            wrapperClassName="flex-1"
          />
          <Button
            variant="secondary"
            onClick={applyDiscountCode}
            disabled={discountStatus === 'checking' || !discountCode.trim()}
          >
            Apply
          </Button>
        </div>
        {discountStatus === 'valid' && <p role="status" aria-live="polite" className="text-[var(--color-pine)] text-sm mt-2">✓ Code applied</p>}
        {discountStatus === 'invalid' && <p role="alert" aria-live="assertive" className="text-[var(--color-danger)] text-sm mt-2">{discountError}</p>}
      </div>

      <Button onClick={proceedToPayment} fullWidth size="lg">
        Continue to Payment
      </Button>
    </main>
  );
}
