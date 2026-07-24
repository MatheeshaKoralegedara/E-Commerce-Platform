'use client';

import { useEffect, useState } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/format';

export default function AdminDiscountsPage() {
  const { token } = useAuth();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('');
  const [minOrderCents, setMinOrderCents] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (token) loadCodes();
  }, [token]);

  async function loadCodes() {
    setLoading(true);
    try {
      const data = await apiRequest('/discounts', { token });
      setCodes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccessMessage('');
    try {
      await apiRequest('/discounts', {
        method: 'POST',
        body: {
          code,
          type,
          value: parseInt(value),
          minOrderCents: minOrderCents ? parseInt(minOrderCents) : 0,
          usageLimit: usageLimit ? parseInt(usageLimit) : null,
        },
        token,
      });
      setSuccessMessage(`Code "${code}" created.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setCode('');
      setValue('');
      setMinOrderCents('');
      setUsageLimit('');
      loadCodes();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeactivate(id) {
    try {
      await apiRequest(`/discounts/${id}`, { method: 'DELETE', token });
      loadCodes();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl mb-6">Discount Codes</h2>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {successMessage && <p className="text-[var(--color-pine)] text-sm mb-4">{successMessage}</p>}

      <form onSubmit={handleCreate} className="border border-[var(--color-line)] rounded-md p-5 mb-8 space-y-3">
        <h3 className="font-medium text-sm">Create new code</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Code (e.g. SAVE10)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="border border-[var(--color-line)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-ink)]"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border border-[var(--color-line)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-ink)]"
          >
            <option value="percentage">Percentage off</option>
            <option value="fixed">Fixed amount off (cents)</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-[var(--color-muted)] block mb-1">
              {type === 'percentage' ? 'Percent (1-100)' : 'Cents off'}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border border-[var(--color-line)] rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:border-[var(--color-ink)]"
              required
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-muted)] block mb-1">Min order (cents, optional)</label>
            <input
              type="number"
              value={minOrderCents}
              onChange={(e) => setMinOrderCents(e.target.value)}
              className="border border-[var(--color-line)] rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:border-[var(--color-ink)]"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-muted)] block mb-1">Usage limit (optional)</label>
            <input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              className="border border-[var(--color-line)] rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:border-[var(--color-ink)]"
            />
          </div>
        </div>
        <button type="submit" disabled={creating} className="btn-primary rounded-md px-4 py-2 text-sm disabled:opacity-50">
          {creating ? 'Creating…' : 'Create Code'}
        </button>
      </form>

      {loading ? (
        <p className="text-[var(--color-muted)] text-sm">Loading codes…</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-muted)] text-xs uppercase tracking-wide">
              <th className="py-2 font-medium">Code</th>
              <th className="py-2 font-medium">Type</th>
              <th className="py-2 font-medium">Value</th>
              <th className="py-2 font-medium">Used</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id} className="border-b border-[var(--color-line)]">
                <td className="py-3 font-mono text-xs">{c.code}</td>
                <td className="py-3">{c.type}</td>
                <td className="py-3">
                  {c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}
                </td>
                <td className="py-3">{c.times_used}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    c.active
                      ? 'bg-[var(--color-pine)]/10 text-[var(--color-pine)]'
                      : 'bg-[var(--color-line)]/60 text-[var(--color-muted)]'
                  }`}>
                    {c.active ? 'active' : 'inactive'}
                  </span>
                </td>
                <td className="py-3">
                  {c.active && (
                    <button onClick={() => handleDeactivate(c.id)} className="text-red-600 underline underline-offset-2 text-xs">
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}