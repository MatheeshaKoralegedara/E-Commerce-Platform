'use client';

import { useEffect, useState } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await apiRequest('/categories');
      setCategories(data);
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
      await apiRequest('/categories', {
        method: 'POST',
        body: { name, slug },
        token,
      });
      setSuccessMessage(`"${name}" created successfully.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setName('');
      setSlug('');
      loadCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await apiRequest(`/categories/${id}`, { method: 'DELETE', token });
      loadCategories();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl mb-6">Categories</h2>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {successMessage && <p className="text-[var(--color-pine)] text-sm mb-4">{successMessage}</p>}

      <form onSubmit={handleCreate} className="border border-[var(--color-line)] rounded-md p-5 mb-8 flex gap-3 items-end">
        <div>
          <label className="text-xs text-[var(--color-muted)] block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-[var(--color-line)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-ink)]"
            required
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)] block mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="border border-[var(--color-line)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-ink)]"
            required
          />
        </div>
        <button type="submit" disabled={creating} className="btn-primary rounded-md px-4 py-2 text-sm disabled:opacity-50">
          {creating ? 'Creating…' : 'Create Category'}
        </button>
      </form>

      {loading ? (
        <p className="text-[var(--color-muted)] text-sm">Loading categories…</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-muted)] text-xs uppercase tracking-wide">
              <th className="py-2 font-medium">Name</th>
              <th className="py-2 font-medium">Slug</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-[var(--color-line)]">
                <td className="py-3">{cat.name}</td>
                <td className="py-3 text-[var(--color-muted)]">{cat.slug}</td>
                <td className="py-3">
                  <button onClick={() => handleDelete(cat.id)} className="text-red-600 underline underline-offset-2 text-xs">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}