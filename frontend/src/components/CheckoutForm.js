
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function CheckoutForm({ orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return; // Stripe.js hasn't loaded yet

    setSubmitting(true);
    setError('');

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}/confirmation`,
      },
    });

    // If we reach here, either an error happened, or Stripe is redirecting.
    // (On success without redirect-required methods, Stripe still may navigate away.)
    if (confirmError) {
      setError(confirmError.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-[var(--color-danger)] text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="btn btn-primary w-full py-3 rounded-md text-sm"
      >
        {submitting ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  );
}