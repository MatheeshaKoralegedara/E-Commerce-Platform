'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/format';

export default function WishlistPage() {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    load();
  }, [authLoading, user]);

  async function load() {
    setLoading(true);
    try {
      const data = await apiRequest('/wishlist', { token });
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(productId) {
    try {
      await apiRequest(`/wishlist/${productId}`, { method: 'DELETE', token });
      setItems((prev) => prev.filter((i) => i.id !== productId));
    } catch (err) {
      setError(err.message);
    }
  }

  if (authLoading || loading) {
    return <main className="max-w-6xl mx-auto px-6 py-16 text-center text-[var(--color-muted)]">Loading…</main>;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <p className="eyebrow mb-2">Saved</p>
      <h1 className="font-display text-2xl sm:text-3xl mb-8">My Wishlist</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {items.length === 0 ? (
        <div>
          <p className="text-[var(--color-muted)] mb-4">Nothing saved yet.</p>
          <Link href="/" className="btn-primary rounded-full px-5 py-2 text-sm inline-block">Browse products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          {items.map((product) => {
            const firstVariant = product.variants[0];
            return (
              <div key={product.id} className="card-product rounded-lg overflow-hidden flex flex-col">
                <Link href={`/products/${product.slug}`} className="group">
                  <div className="aspect-square bg-[var(--color-line)]/40 overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)] text-sm">No image</div>
                    )}
                  </div>
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <Link href={`/products/${product.slug}`}>
                    <h2 className="font-display text-lg leading-snug">{product.name}</h2>
                  </Link>
                  {firstVariant && <p className="mt-1 font-medium">{formatPrice(firstVariant.price_cents)}</p>}
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="mt-auto pt-3 text-xs text-left text-red-600 underline underline-offset-2 self-start"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
