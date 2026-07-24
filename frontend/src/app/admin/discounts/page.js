
'use client';

import { useEffect, useState } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function AdminDiscountsPage() {
  const { token } = useAuth();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <h2 className="text-xl font-bold mb-4">Discount Codes</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleCreate} className="border rounded-lg p-4 mb-8 space-y-3">
        <h3 className="font-medium">Create New Code</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Code (e.g. SAVE10)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="border rounded px-3 py-2 text-sm"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="percentage">Percentage off</option>
            <option value="fixed">Fixed amount off (cents)</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              {type === 'percentage' ? 'Percent (1-100)' : 'Cents off'}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Min order (cents, optional)</label>
            <input
              type="number"
              value={minOrderCents}
              onChange={(e) => setMinOrderCents(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Usage limit (optional)</label>
            <input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Code'}
        </button>
      </form>

      {loading ? (
        <p>Loading codes...</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Code</th>
              <th className="py-2">Type</th>
              <th className="py-2">Value</th>
              <th className="py-2">Used</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="py-2 font-mono">{c.code}</td>
                <td className="py-2">{c.type}</td>
                <td className="py-2">
                  {c.type === 'percentage' ? `${c.value}%` : `$${(c.value / 100).toFixed(2)}`}
                </td>
                <td className="py-2">{c.times_used}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {c.active ? 'active' : 'inactive'}
                  </span>
                </td>
                <td className="py-2">
                  {c.active && (
                    <button onClick={() => handleDeactivate(c.id)} className="text-red-600 underline text-xs">
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