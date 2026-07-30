'use client';

import { useEffect, useState } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import StarRating from '@/components/ui/StarRating';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';

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

  if (loading) return <div className="skeleton h-48 rounded-lg"></div>;

  return (
    <div>
      <h2 className="font-display text-2xl mb-6">Reviews</h2>
      {error && <Alert className="mb-4">{error}</Alert>}

      {reviews.length === 0 ? (
        <EmptyState icon="⭐" title="No reviews yet" />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card rounded-lg p-4 flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{r.product_name}</p>
                <StarRating rating={r.rating} className="mt-0.5" />
                {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                className="text-[var(--color-danger)] underline underline-offset-2 text-xs whitespace-nowrap"
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
