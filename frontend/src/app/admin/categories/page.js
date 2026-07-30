'use client';

import { useEffect, useState } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

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

      {error && <Alert className="mb-4">{error}</Alert>}
      {successMessage && <Alert tone="success" className="mb-4">{successMessage}</Alert>}

      <form onSubmit={handleCreate} className="card rounded-lg p-5 mb-8 flex flex-wrap gap-3 items-end">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <Button type="submit" disabled={creating} size="sm">
          {creating ? 'Creating…' : 'Create Category'}
        </Button>
      </form>

      {loading ? (
        <div className="skeleton h-40 rounded-lg"></div>
      ) : (
        <div className="card rounded-lg overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-muted)] text-xs uppercase tracking-wide">
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Slug</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-canvas)]">
                  <td className="py-3 px-4">{cat.name}</td>
                  <td className="py-3 px-4 text-[var(--color-muted)]">{cat.slug}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleDelete(cat.id)} className="text-[var(--color-danger)] underline underline-offset-2 text-xs">
                      Delete
                    </button>
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
