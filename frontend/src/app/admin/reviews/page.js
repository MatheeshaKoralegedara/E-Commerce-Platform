
'use client';

import { useEffect, useState } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function AdminReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) load();
  }, [token]);

  async function load() {
    setLoading(true);
    try {
      const data = await apiRequest('/admin/reviews', { token });
      setReviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(reviewId) {
    if (!confirm('Remove this review? This cannot be undone.')) return;
    try {
      await apiRequest(`/admin/reviews/${reviewId}`, { method: 'DELETE', token });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="text-[var(--color-muted)] text-sm">Loading reviews…</p>;

  return (
    <div>
      <h2 className="font-display text-2xl mb-6">Reviews</h2>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {reviews.length === 0 ? (
        <p className="text-[var(--color-muted)] text-sm">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="border border-[var(--color-line)] rounded-md p-4 flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{r.product_name}</p>
                <p className="text-[var(--color-clay)] text-sm">
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </p>
                {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                className="text-red-600 underline underline-offset-2 text-xs whitespace-nowrap"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}