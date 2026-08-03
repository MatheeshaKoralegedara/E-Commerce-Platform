// frontend/src/app/account/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function AccountPage() {
  const { token, user, loading: authLoading, login } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    // Pre-fill the form with the user's current saved info
    setFullName(user.full_name || '');
    setPhone(user.phone || '');
    setAddressLine1(user.address_line1 || '');
    setCity(user.city || '');
    setPostalCode(user.postal_code || '');
    setCountry(user.country || '');
  }, [authLoading, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const data = await apiRequest('/auth/profile', {
        method: 'PATCH',
        body: { fullName, phone, addressLine1, city, postalCode, country },
        token,
      });
      // Update the auth context's stored user so the rest of the app
      // (navbar, checkout pre-fill, etc.) reflects the change immediately
      login(token, data.user);
      setSuccessMessage('Profile updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user) {
    return <main className="max-w-lg mx-auto px-6 py-16 text-center text-[var(--color-muted)]">Loading…</main>;
  }

  return (
    <main className="max-w-lg mx-auto px-6 py-16">
      <p className="eyebrow mb-2">Account</p>
      <h1 className="font-display text-3xl mb-8">My Profile</h1>

      <p className="text-sm text-[var(--color-muted)] mb-6">
        Signed in as <span className="font-medium text-[var(--color-ink)]">{user.email}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="text-sm font-medium block mb-1">Full name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="text-sm font-medium block mb-1">Phone number</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
            required
          />
        </div>

        <div className="pt-2 border-t border-[var(--color-line)]">
          <p className="text-xs text-[var(--color-muted)] mb-3 mt-4">Shipping address</p>
          <div className="space-y-3">
            <div>
              <label htmlFor="addressLine1" className="text-sm font-medium block mb-1">Address</label>
              <input
                id="addressLine1"
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city" className="text-sm font-medium block mb-1">City</label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="text-sm font-medium block mb-1">Postal code</label>
                <input
                  id="postalCode"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="country" className="text-sm font-medium block mb-1">Country</label>
              <input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border border-[var(--color-line)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
              />
            </div>
          </div>
        </div>

        {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
        {successMessage && <p role="status" aria-live="polite" className="text-[var(--color-pine)] text-sm">{successMessage}</p>}

        <button type="submit" disabled={saving} className="btn-primary rounded-md w-full py-2.5 text-sm disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </main>
  );
}