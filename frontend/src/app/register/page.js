// frontend/src/app/register/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await apiRequest('/auth/register', { method: 'POST', body: { email, password } });
      login(data.token, data.user);
      router.push('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-20">
      <p className="eyebrow mb-2 text-center">New here</p>
      <h1 className="font-display text-3xl mb-8 text-center">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)] transition-colors"
          required
        />
        <input
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)] transition-colors"
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="btn-primary rounded-md w-full py-2.5 text-sm">
          Create Account
        </button>
      </form>
    </main>
  );
}