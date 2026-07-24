// frontend/src/app/admin/categories/page.js
'use client';

import { useEffect, useState } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    try {
      await apiRequest('/categories', {
        method: 'POST',
        body: { name, slug },
        token,
      });
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
      <h2 className="text-xl font-bold mb-4">Categories</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleCreate} className="border rounded-lg p-4 mb-8 flex gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Category'}
        </button>
      </form>

      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Name</th>
              <th className="py-2">Slug</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b">
                <td className="py-2">{cat.name}</td>
                <td className="py-2 text-gray-500">{cat.slug}</td>
                <td className="py-2">
                  <button onClick={() => handleDelete(cat.id)} className="text-red-600 underline text-xs">
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