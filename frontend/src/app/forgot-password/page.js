
'use client';

import { useState } from 'react';
import apiRequest from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await apiRequest('/auth/forgot-password', { method: 'POST', body: { email } });
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <main className="max-w-sm mx-auto px-6 py-20 text-center">
        <p className="font-display text-2xl mb-3">Check your email</p>
        <p className="text-[var(--color-muted)] text-sm">
          If that email is registered, we've sent a password reset link.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-20">
      <p className="eyebrow mb-2 text-center">Reset password</p>
      <h1 className="font-display text-3xl mb-8 text-center">Forgot your password?</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={status === 'loading'} className="btn-primary rounded-md w-full py-2.5 text-sm disabled:opacity-50">
          {status === 'loading' ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>
    </main>
  );
}