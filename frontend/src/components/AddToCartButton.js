
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function AddToCartButton({ variantId, stockQty }) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState('idle'); // idle | loading | added | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleAddToCart() {
    if (!user) {
      router.push('/login');
      return;
    }

    setStatus('loading');
    setErrorMsg('');
    try {
      await apiRequest('/cart/items', {
        method: 'POST',
        body: { variantId, quantity: 1 },
        token,
      });
      setStatus('added');
      setTimeout(() => setStatus('idle'), 1500); // reset button text after a moment
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
        className="mt-2 bg-black text-white px-4 py-2 rounded disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Adding...' : status === 'added' ? 'Added ✓' : 'Add to Cart'}
      </button>
      {errorMsg && <p className="text-red-600 text-sm mt-1">{errorMsg}</p>}
    </div>
  );
}