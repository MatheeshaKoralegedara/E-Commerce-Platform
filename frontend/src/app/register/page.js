// frontend/src/app/register/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 4) return { score, label: 'Medium', color: 'bg-yellow-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const passwordStrength = getPasswordStrength(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: { email, password, fullName, phone, addressLine1, city, postalCode, country },
      });
      login(data.token, data.user);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-20">
      <p className="eyebrow mb-2 text-center">New here</p>
      <h1 className="font-display text-3xl mb-8 text-center">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
          required
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
          required
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-[var(--color-ink)]"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {password && (
          <div>
            <div className="flex gap-1 h-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-colors ${
                    passwordStrength.score > i * 2 ? passwordStrength.color : 'bg-[var(--color-line)]'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-[var(--color-muted)] mt-1">{passwordStrength.label}</p>
          </div>
        )}
        <p className="text-xs text-[var(--color-muted)]">
          Must include an uppercase letter, lowercase letter, and a number.
        </p>

        <div className="pt-2 border-t border-[var(--color-line)]">
          <p className="text-xs text-[var(--color-muted)] mb-3">Shipping address (optional — add later if you prefer)</p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Address"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
              />
              <input
                type="text"
                placeholder="Postal code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
              />
            </div>
            <input
              type="text"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary rounded-md w-full py-2.5 text-sm disabled:opacity-50">
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </main>
  );
}