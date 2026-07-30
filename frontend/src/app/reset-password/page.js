'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { Input } from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

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
      <main className="max-w-sm mx-auto px-6 py-20 text-center">
        <Alert>Invalid reset link.</Alert>
      </main>
    );
  }

  if (status === 'done') {
    return (
      <main className="max-w-sm mx-auto px-6 py-20 text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[var(--color-pine-light)] flex items-center justify-center text-2xl">✓</div>
        <p className="font-display text-2xl mb-3">Password updated</p>
        <p className="text-[var(--color-muted)] text-sm">Redirecting you to log in…</p>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-20">
      <div className="card rounded-lg p-8" style={{ boxShadow: 'var(--shadow-md)' }}>
        <h1 className="font-display text-3xl mb-8 text-center">Set a new password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Min 8 characters"
            label="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          {error && <Alert>{error}</Alert>}
          <Button type="submit" fullWidth disabled={status === 'loading'}>
            {status === 'loading' ? 'Updating…' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </main>
  );
}
