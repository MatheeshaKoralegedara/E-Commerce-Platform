
'use client';

import { useState } from 'react';
import apiRequest from '@/lib/api';
import { Input } from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

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
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[var(--color-pine-light)] flex items-center justify-center text-2xl">✉️</div>
        <p className="font-display text-2xl mb-3">Check your email</p>
        <p className="text-[var(--color-muted)] text-sm">
          If that email is registered, we've sent a password reset link.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-20">
      <div className="card rounded-lg p-8" style={{ boxShadow: 'var(--shadow-md)' }}>
        <p className="eyebrow mb-2 text-center">Reset password</p>
        <h1 className="font-display text-3xl mb-8 text-center">Forgot your password?</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="you@example.com"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <Alert>{error}</Alert>}
          <Button type="submit" fullWidth disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending…' : 'Send Reset Link'}
          </Button>
        </form>
      </div>
    </main>
  );
}
