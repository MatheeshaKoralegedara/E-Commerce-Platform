'use client';

import { useEffect, useState } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/format';
import { Input, Select } from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';

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
  const [perUserLimit, setPerUserLimit] = useState('');

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
          code, type, value: parseInt(value),
          minOrderCents: minOrderCents ? parseInt(minOrderCents) : 0,
          usageLimit: usageLimit ? parseInt(usageLimit) : null,
          perUserLimit: perUserLimit ? parseInt(perUserLimit) : null,
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

      {error && <Alert className="mb-4">{error}</Alert>}
      {successMessage && <Alert tone="success" className="mb-4">{successMessage}</Alert>}

      <form onSubmit={handleCreate} className="card rounded-lg p-5 mb-8 space-y-3">
        <h3 className="font-medium text-sm">Create new code</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="text"
            placeholder="Code (e.g. SAVE10)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="percentage">Percentage off</option>
            <option value="fixed">Fixed amount off (cents)</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            type="number"
            label={type === 'percentage' ? 'Percent (1-100)' : 'Cents off'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
          <Input
            type="number"
            label="Min order (cents, optional)"
            value={minOrderCents}
            onChange={(e) => setMinOrderCents(e.target.value)}
          />
          <Input
            type="number"
            label="Usage limit (optional)"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
          />
          <Input
            type="number"
            label="Per-user limit (optional)"
            value={perUserLimit}
            onChange={(e) => setPerUserLimit(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={creating} size="sm">
          {creating ? 'Creating…' : 'Create Code'}
        </Button>
      </form>

      {loading ? (
        <div className="skeleton h-48 rounded-lg"></div>
      ) : (
        <div className="card rounded-lg overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-muted)] text-xs uppercase tracking-wide">
                <th className="py-3 px-4 font-medium">Code</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Value</th>
                <th className="py-3 px-4 font-medium">Used</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-canvas)]">
                  <td className="py-3 px-4 font-mono text-xs">{c.code}</td>
                  <td className="py-3 px-4">{c.type}</td>
                  <td className="py-3 px-4">
                    {c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}
                  </td>
                  <td className="py-3 px-4">{c.times_used}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                  <td className="py-3 px-4">
                    <Badge tone={c.active ? 'pine' : 'neutral'}>{c.active ? 'active' : 'inactive'}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    {c.active && (
                      <button onClick={() => handleDeactivate(c.id)} className="text-[var(--color-danger)] underline underline-offset-2 text-xs">
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
