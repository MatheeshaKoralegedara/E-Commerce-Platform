// frontend/src/components/ReviewForm.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function ReviewForm({ productId }) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  if (!user) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        <a href="/login" className="underline underline-offset-2 text-[var(--color-pine)]">Log in</a> to leave a review.
      </p>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await apiRequest(`/products/${productId}/reviews`, {
        method: 'POST',
        body: { rating, comment },
        token,
      });
      setStatus('done');
      router.refresh();
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  }

  if (status === 'done') {
    return <p className="text-[var(--color-pine)] text-sm">Thanks for your review!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[var(--color-line)] rounded-md p-5 space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">Rating</label>
        <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= (hoverRating || rating);
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                aria-label={`${n} star${n !== 1 ? 's' : ''}`}
                className="text-3xl leading-none transition-transform hover:scale-110"
                style={{ color: filled ? 'var(--color-clay)' : 'var(--color-line)' }}
              >
                ★
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border border-[var(--color-line)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-ink)] transition-colors"
          rows={3}
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary rounded-md px-4 py-2 text-sm disabled:opacity-50"
      >
        {status === 'loading' ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}