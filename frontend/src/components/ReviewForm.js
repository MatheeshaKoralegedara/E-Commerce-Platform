// frontend/src/components/ReviewForm.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { Textarea } from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

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
      <p className="text-sm text-[var(--color-muted)] card rounded-lg px-4 py-3">
        <a href="/login" className="underline underline-offset-2 text-[var(--color-pine)] font-medium">Log in</a> to leave a review.
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
    return (
      <Alert tone="success">Thanks for your review!</Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card rounded-lg p-5 space-y-4">
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
      <Textarea
        label="Comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />
      {error && <Alert>{error}</Alert>}
      <Button type="submit" disabled={status === 'loading'} size="sm">
        {status === 'loading' ? 'Submitting…' : 'Submit Review'}
      </Button>
    </form>
  );
}
