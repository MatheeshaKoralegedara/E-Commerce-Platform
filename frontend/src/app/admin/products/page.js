
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
  const [expandedId, setExpandedId] = useState(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [creating, setCreating] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

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
      // Fetch variants for each product (admin/all doesn't include them, unlike public listing)
      const withVariants = await Promise.all(
        productsData.map(async (p) => {
          try {
            const detail = await apiRequest(`/products/${p.slug}`);
            return { ...p, variants: detail.variants };
          } catch {
            return { ...p, variants: [] }; // draft products might not be publicly fetchable
          }
        })
      );
      setProducts(withVariants);
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
      await apiRequest('/products', {
        method: 'POST',
        body: { name, slug, description, categoryId: categoryId || null, imageUrl: imageUrl || null },
        token,
      });
      setName('');
      setSlug('');
      setDescription('');
      setCategoryId('');
      setImageUrl('');
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
        <input
          type="text"
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full border rounded px-3 py-3 py-2 text-sm"
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
        <button
          type="submit"
          disabled={creating}
          className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Product'}
        </button>
      </form>

      <div className="space-y-2">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg">
            <div className="flex justify-between items-center p-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                  className="text-xs underline"
                >
                  {expandedId === product.id ? 'Hide' : 'Manage'} variants
                </button>
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.slug} · {product.variants?.length || 0} variant(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {product.status}
                </span>
                <button onClick={() => toggleStatus(product)} className="text-blue-600 underline text-xs">
                  {product.status === 'active' ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>

            {expandedId === product.id && (
              <VariantManager product={product} token={token} onChange={loadData} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VariantManager({ product, token, onChange }) {
  const [sku, setSku] = useState('');
  const [priceCents, setPriceCents] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [attrKey, setAttrKey] = useState('');
  const [attrValue, setAttrValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleAddVariant(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const attributes = attrKey ? { [attrKey]: attrValue } : {};
      await apiRequest(`/products/${product.id}/variants`, {
        method: 'POST',
        body: { sku, priceCents: parseInt(priceCents), attributes, stockQty: parseInt(stockQty) },
        token,
      });
      setSku('');
      setPriceCents('');
      setStockQty('');
      setAttrKey('');
      setAttrValue('');
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-t bg-gray-50 p-3">
      {product.variants && product.variants.length > 0 && (
        <table className="w-full text-xs mb-3">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="pb-1">SKU</th>
              <th className="pb-1">Price</th>
              <th className="pb-1">Stock</th>
              <th className="pb-1">Attributes</th>
            </tr>
          </thead>
          <tbody>
            {product.variants.map((v) => (
              <tr key={v.id}>
                <td className="py-1">{v.sku}</td>
                <td className="py-1">${(v.price_cents / 100).toFixed(2)}</td>
                <td className="py-1">{v.stock_qty}</td>
                <td className="py-1">
                  {Object.entries(v.attributes || {}).map(([k, val]) => `${k}: ${val}`).join(', ') || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form onSubmit={handleAddVariant} className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-xs block">SKU</label>
          <input value={sku} onChange={(e) => setSku(e.target.value)} className="border rounded px-2 py-1 text-xs w-28" required />
        </div>
        <div>
          <label className="text-xs block">Price (cents)</label>
          <input type="number" value={priceCents} onChange={(e) => setPriceCents(e.target.value)} className="border rounded px-2 py-1 text-xs w-24" required />
        </div>
        <div>
          <label className="text-xs block">Stock</label>
          <input type="number" value={stockQty} onChange={(e) => setStockQty(e.target.value)} className="border rounded px-2 py-1 text-xs w-20" required />
        </div>
        <div>
          <label className="text-xs block">Attr name</label>
          <input value={attrKey} onChange={(e) => setAttrKey(e.target.value)} placeholder="color" className="border rounded px-2 py-1 text-xs w-20" />
        </div>
        <div>
          <label className="text-xs block">Attr value</label>
          <input value={attrValue} onChange={(e) => setAttrValue(e.target.value)} placeholder="blue" className="border rounded px-2 py-1 text-xs w-20" />
        </div>
        <button type="submit" disabled={saving} className="bg-black text-white px-3 py-1.5 rounded text-xs disabled:opacity-50">
          {saving ? 'Adding...' : 'Add Variant'}
        </button>
      </form>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}