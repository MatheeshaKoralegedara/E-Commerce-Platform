// frontend/src/app/register/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function RegisterPage() {
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
      const data = await apiRequest('/auth/register', { method: 'POST', body: { email, password } });
      login(data.token, data.user);
      router.push('/');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-20">
      <div className="card rounded-lg p-8" style={{ boxShadow: 'var(--shadow-md)' }}>
        <p className="eyebrow mb-2 text-center">New here</p>
        <h1 className="font-display text-3xl mb-8 text-center">Create an account</h1>
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
            placeholder="Min 8 characters"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <Alert>{error}</Alert>}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>
      </div>
      <p className="text-center text-sm text-[var(--color-muted)] mt-6">
        Already have an account? <a href="/login" className="text-[var(--color-ink)] font-medium underline underline-offset-2">Log in</a>
      </p>
    </main>
  );
}
