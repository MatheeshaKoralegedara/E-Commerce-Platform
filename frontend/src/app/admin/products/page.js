
'use client';

import { useEffect, useState } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New product form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  async function loadData() {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiRequest('/products/admin/all', { token }),
        apiRequest('/categories'),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
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
      const newProduct = await apiRequest('/products', {
        method: 'POST',
        body: { name, slug, description, categoryId: categoryId || null },
        token,
      });
      // Reset form
      setName('');
      setSlug('');
      setDescription('');
      setCategoryId('');
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function toggleStatus(product) {
    const newStatus = product.status === 'active' ? 'draft' : 'active';
    try {
      await apiRequest(`/products/${product.id}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
        token,
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading products...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Products</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Create product form */}
      <form onSubmit={handleCreate} className="border rounded-lg p-4 mb-8 space-y-3">
        <h3 className="font-medium">Add New Product</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="text"
            placeholder="Slug (e.g. blue-hoodie)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
          rows={2}
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">No category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          Note: after creating, add at least one variant via the API before publishing (variant management UI coming later).
        </p>
        <button
          type="submit"
          disabled={creating}
          className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Product'}
        </button>
      </form>

      {/* Product list */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Name</th>
            <th className="py-2">Slug</th>
            <th className="py-2">Status</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b">
              <td className="py-2">{product.name}</td>
              <td className="py-2 text-gray-500">{product.slug}</td>
              <td className="py-2">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {product.status}
                </span>
              </td>
              <td className="py-2">
                <button
                  onClick={() => toggleStatus(product)}
                  className="text-blue-600 underline text-xs"
                >
                  {product.status === 'active' ? 'Unpublish' : 'Publish'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}