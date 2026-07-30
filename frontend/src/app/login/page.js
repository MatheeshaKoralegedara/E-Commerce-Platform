
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { getGuestToken, clearGuestToken } from '@/lib/guestToken';
import { Input } from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const guestToken = getGuestToken();
      const data = await apiRequest('/auth/login', { method: 'POST', body: { email, password, guestToken } });
      login(data.token, data.user);
      clearGuestToken(); // merged server-side now, stop sending it
      router.push('/');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-20">
      <div className="card rounded-lg p-8 shadow-[var(--shadow-md)]" style={{ boxShadow: 'var(--shadow-md)' }}>
        <p className="eyebrow mb-2 text-center">Welcome back</p>
        <h1 className="font-display text-3xl mb-8 text-center">Log in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="you@example.com"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="••••••••"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="text-right -mt-2">
            <a href="/forgot-password" className="text-xs text-[var(--color-pine)] underline underline-offset-2">
              Forgot password?
            </a>
          </div>
          {error && <Alert>{error}</Alert>}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Logging in…' : 'Log In'}
          </Button>
        </form>
      </div>
      <p className="text-center text-sm text-[var(--color-muted)] mt-6">
        New here? <a href="/register" className="text-[var(--color-ink)] font-medium underline underline-offset-2">Create an account</a>
      </p>
    </main>
  );
}
