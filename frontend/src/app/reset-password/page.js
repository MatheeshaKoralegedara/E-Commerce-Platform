'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await apiRequest('/auth/reset-password', { method: 'POST', body: { token, newPassword } });
      setStatus('done');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  if (!token) {
    return (
      <main className="max-w-sm mx-auto px-6 py-20 text-center text-red-600 text-sm">
        Invalid reset link.
      </main>
    );
  }

  if (status === 'done') {
    return (
      <main className="max-w-sm mx-auto px-6 py-20 text-center">
        <p className="font-display text-2xl mb-3">Password updated</p>
        <p className="text-[var(--color-muted)] text-sm">Redirecting you to log in…</p>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-display text-3xl mb-8 text-center">Set a new password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New password (min 8 characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={status === 'loading'} className="btn-primary rounded-md w-full py-2.5 text-sm disabled:opacity-50">
          {status === 'loading' ? 'Updating…' : 'Reset Password'}
        </button>
      </form>
    </main>
  );
}