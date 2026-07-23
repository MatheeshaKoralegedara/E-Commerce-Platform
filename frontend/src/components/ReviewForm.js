
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function ReviewForm({ productId }) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  if (!user) {
    return (
      <p className="text-sm text-gray-500">
        <a href="/login" className="underline">Log in</a> to leave a review.
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
      router.refresh(); // re-fetches the server component data, showing the new review immediately
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  }

  if (status === 'done') {
    return <p className="text-green-600 text-sm">Thanks for your review!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-3">
      <div>
        <label className="text-sm font-medium block mb-1">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n} star{n !== 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
          rows={3}
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
      >
        {status === 'loading' ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}