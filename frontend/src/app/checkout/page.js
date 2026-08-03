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

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState(null);

  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [shippingCountry, setShippingCountry] = useState('');

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

    // Pre-fill shipping info from the user's saved profile
    setShippingName(user.full_name || '');
    setShippingPhone(user.phone || '');
    setShippingAddress(user.address_line1 || '');
    setShippingCity(user.city || '');
    setShippingPostalCode(user.postal_code || '');
    setShippingCountry(user.country || '');

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

  async function proceedToPayment(e) {
    e.preventDefault();
    setError('');

    if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddress.trim() || !shippingCity.trim()) {
      setError('Please fill in your name, phone, address, and city before continuing.');
      return;
    }

    try {
      const newOrder = await apiRequest('/orders/checkout', {
        method: 'POST',
        body: {
          discountCode: discountStatus === 'valid' ? discountCode.trim() : null,
          shippingInfo: {
            name: shippingName.trim(),
            phone: shippingPhone.trim(),
            addressLine1: shippingAddress.trim(),
            city: shippingCity.trim(),
            postalCode: shippingPostalCode.trim(),
            country: shippingCountry.trim(),
          },
        },
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
    return <main className="max-w-lg mx-auto px-6 py-16 text-center text-[var(--color-muted)]">Loading…</main>;
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
        <p className="text-[var(--color-muted)] mb-2">Total: {formatPrice(order.total_cents)}</p>
        <p className="text-xs text-[var(--color-muted)] mb-8">
          Shipping to: {order.shipping_name}, {order.shipping_address_line1}, {order.shipping_city}
        </p>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm orderId={order.id} />
        </Elements>
      </main>
    );
  }

  const discountPreviewCents = discountStatus === 'valid' ? discountInfo.discountCents : 0;
  const estimatedTotal = cart.subtotalCents - discountPreviewCents;

  return (
    <main className="max-w-lg mx-auto px-6 py-16">
      <p className="eyebrow mb-2">Checkout</p>
      <h1 className="font-display text-3xl mb-8">Review your order</h1>

      <div className="border border-[var(--color-line)] rounded-md p-5 mb-6">
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
          <span>{formatPrice(estimatedTotal)}</span>
        </div>
      </div>

      <div className="mb-8">
        <label htmlFor="discountCode" className="text-sm font-medium block mb-2">Discount code</label>
        <div className="flex gap-2">
          <input
            id="discountCode"
            type="text"
            value={discountCode}
            onChange={(e) => {
              setDiscountCode(e.target.value);
              setDiscountStatus('idle');
            }}
            placeholder="Enter code"
            className="flex-1 border border-[var(--color-line)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-ink)]"
          />
          <button
            onClick={applyDiscountCode}
            disabled={discountStatus === 'checking' || !discountCode.trim()}
            className="btn-secondary rounded-md px-4 py-2 text-sm disabled:opacity-50"
          >
            Apply
          </button>
        </div>
        {discountStatus === 'valid' && <p role="status" aria-live="polite" className="text-[var(--color-pine)] text-sm mt-2">Code applied</p>}
        {discountStatus === 'invalid' && <p role="alert" aria-live="assertive" className="text-red-600 text-sm mt-2">{discountError}</p>}
      </div>

      <form onSubmit={proceedToPayment} className="space-y-4">
        <h2 className="font-medium text-sm border-t border-[var(--color-line)] pt-6">Shipping details</h2>

        <div>
          <label htmlFor="shippingName" className="text-sm font-medium block mb-1">Full name</label>
          <input
            id="shippingName"
            type="text"
            value={shippingName}
            onChange={(e) => setShippingName(e.target.value)}
            className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
            required
          />
        </div>

        <div>
          <label htmlFor="shippingPhone" className="text-sm font-medium block mb-1">Phone number</label>
          <input
            id="shippingPhone"
            type="tel"
            value={shippingPhone}
            onChange={(e) => setShippingPhone(e.target.value)}
            className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
            required
          />
        </div>

        <div>
          <label htmlFor="shippingAddress" className="text-sm font-medium block mb-1">Address</label>
          <input
            id="shippingAddress"
            type="text"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="shippingCity" className="text-sm font-medium block mb-1">City</label>
            <input
              id="shippingCity"
              type="text"
              value={shippingCity}
              onChange={(e) => setShippingCity(e.target.value)}
              className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
              required
            />
          </div>
          <div>
            <label htmlFor="shippingPostalCode" className="text-sm font-medium block mb-1">Postal code</label>
            <input
              id="shippingPostalCode"
              type="text"
              value={shippingPostalCode}
              onChange={(e) => setShippingPostalCode(e.target.value)}
              className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="shippingCountry" className="text-sm font-medium block mb-1">Country</label>
          <input
            id="shippingCountry"
            type="text"
            value={shippingCountry}
            onChange={(e) => setShippingCountry(e.target.value)}
            className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
          />
        </div>

        {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}

        <button type="submit" className="btn-primary rounded-md w-full py-3 text-sm">
          Continue to Payment
        </button>
      </form>
    </main>
  );
}