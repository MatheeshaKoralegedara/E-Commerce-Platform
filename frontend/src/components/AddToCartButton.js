'use client';

import { useState } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function AddToCartButton({ variantId, stockQty }) {
  const { token, user } = useAuth();
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleAddToCart() {
    setStatus('loading');
    setErrorMsg('');
    try {
      await apiRequest('/cart/items', {
        method: 'POST',
        body: { variantId, quantity: 1 },
        token,
      });
      setStatus('added');
      setTimeout(() => setStatus('idle'), 1500);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  }

  return (
    <div>
      <button
        onClick={handleAddToCart}
        disabled={stockQty === 0 || status === 'loading'}
        className={`btn rounded-full px-5 py-2 text-sm ${status === 'added' ? '' : 'btn-primary'}`}
        style={status === 'added' ? { background: 'var(--color-pine)', color: 'white' } : undefined}
      >
        {status === 'loading' ? 'Adding…' : status === 'added' ? 'Added ✓' : 'Add to Cart'}
      </button>
      {errorMsg && <p className="text-[var(--color-danger)] text-xs mt-1">{errorMsg}</p>}
    </div>
  );
}
