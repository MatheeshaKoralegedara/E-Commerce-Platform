'use client';

import { useState, useEffect } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function WishlistButton({ productId }) {
  const { token, user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    apiRequest('/wishlist/ids', { token })
      .then((ids) => setSaved(ids.includes(productId)))
      .catch(() => {});
  }, [user, productId]);

  async function toggle(e) {
    e.preventDefault(); // in case this button sits inside a <Link> product card
    if (!user) return;
    setLoading(true);
    try {
      if (saved) {
        await apiRequest(`/wishlist/${productId}`, { method: 'DELETE', token });
        setSaved(false);
      } else {
        await apiRequest('/wishlist', { method: 'POST', body: { productId }, token });
        setSaved(true);
      }
    } catch {
      // fail silently — not critical enough to interrupt browsing
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null; // guests can't save; could redirect to login instead if preferred

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-pressed={saved}
      className="text-xl leading-none"
    >
      {saved ? '♥' : '♡'}
    </button>
  );
}
