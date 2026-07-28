'use client';

import { useEffect, useState } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/format';

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
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
    setSuccessMessage('');
    try {
      await apiRequest('/products', {
        method: 'POST',
        body: { name, slug, description, categoryId: categoryId || null, imageUrl: imageUrl || null },
        token,
      });
      setSuccessMessage(`"${name}" created successfully.`);
      setTimeout(() => setSuccessMessage(''), 3000);
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

  function toggleSelect(productId) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (products.length > 0 && selectedIds.size === products.length) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(products.map((product) => product.id)));
  }

  async function handleBulkStatus(status) {
    if (selectedIds.size === 0) return;

    try {
      await Promise.all(
        Array.from(selectedIds).map((productId) =>
          apiRequest(`/products/${productId}/status`, {
            method: 'PATCH',
            body: { status },
            token,
          })
        )
      );
      setSelectedIds(new Set());
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="text-[var(--color-muted)] text-sm">Loading products…</p>;

  return (
    <div>
      <h2 className="font-display text-2xl mb-6">Products</h2>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {successMessage && <p className="text-[var(--color-pine)] text-sm mb-4">{successMessage}</p>}

      <form onSubmit={handleCreate} className="border border-[var(--color-line)] rounded-md p-5 mb-8 space-y-3">
        <h3 className="font-medium text-sm">Add new product</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-[var(--color-line)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-ink)] transition-colors"
            required
          />
          <input
            type="text"
            placeholder="Slug (e.g. blue-hoodie)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="border border-[var(--color-line)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-ink)] transition-colors"
            required
          />
        </div>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-[var(--color-line)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-ink)] transition-colors"
          rows={2}
        />
        <input
          type="text"
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full border border-[var(--color-line)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-ink)] transition-colors"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border border-[var(--color-line)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-ink)] transition-colors"
        >
          <option value="">No category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button type="submit" disabled={creating} className="btn-primary rounded-md px-4 py-2 text-sm disabled:opacity-50">
          {creating ? 'Creating…' : 'Create Product'}
        </button>
      </form>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-[var(--color-pine)]/5 border border-[var(--color-pine)]/20 rounded-md">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <button onClick={() => handleBulkStatus('active')} className="btn-secondary rounded-md px-3 py-1.5 text-xs">
            Publish
          </button>
          <button onClick={() => handleBulkStatus('draft')} className="btn-secondary rounded-md px-3 py-1.5 text-xs">
            Unpublish
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-[var(--color-muted)] underline underline-offset-2 ml-auto">
            Clear selection
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mb-2 px-1">
        <input
          type="checkbox"
          checked={products.length > 0 && selectedIds.size === products.length}
          onChange={toggleSelectAll}
        />
        <span className="text-xs text-[var(--color-muted)]">Select all</span>
      </div>

      <div className="space-y-2">
        {products.map((product) => (
          <div key={product.id} className="border border-[var(--color-line)] rounded-md">
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(product.id)}
                  onChange={() => toggleSelect(product.id)}
                  className="rounded border-[var(--color-line)]"
                />
                <button
                  onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                  className="text-xs text-[var(--color-pine)] underline underline-offset-2"
                >
                  {expandedId === product.id ? 'Hide' : 'Manage'} variants
                </button>
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-[var(--color-muted)]">{product.slug} · {product.variants?.length || 0} variant(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  product.status === 'active'
                    ? 'bg-[var(--color-pine)]/10 text-[var(--color-pine)]'
                    : 'bg-[var(--color-line)]/60 text-[var(--color-muted)]'
                }`}>
                  {product.status}
                </span>
                <button onClick={() => toggleStatus(product)} className="text-xs text-[var(--color-pine)] underline underline-offset-2">
                  {product.status === 'active' ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => setEditingId(editingId === product.id ? null : product.id)} className="text-xs text-[var(--color-pine)] underline underline-offset-2">
                  {editingId === product.id ? 'Cancel edit' : 'Edit'}
                </button>
              </div>
            </div>

            {expandedId === product.id && (
              <VariantManager product={product} token={token} onChange={loadData} />
            )}
            {editingId === product.id && (
              <ProductEditForm
                product={product}
                categories={categories}
                token={token}
                onChange={loadData}
                onCancel={() => setEditingId(null)}
              />
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

  async function handleDeleteVariant(variantId) {
    if (!confirm('Delete this variant? This cannot be undone.')) return;
    try {
      await apiRequest(`/products/${product.id}/variants/${variantId}`, {
        method: 'DELETE',
        token,
      });
      onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="border-t border-[var(--color-line)] bg-[var(--color-canvas)] p-4">
      {product.variants && product.variants.length > 0 && (
        <table className="w-full text-xs mb-4">
          <thead>
            <tr className="text-left text-[var(--color-muted)] uppercase tracking-wide">
              <th className="pb-2 font-medium">SKU</th>
              <th className="pb-2 font-medium">Price</th>
              <th className="pb-2 font-medium">Stock</th>
              <th className="pb-2 font-medium">Attributes</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {product.variants.map((v) => (
              <tr key={v.id} className="border-t border-[var(--color-line)]">
                <td className="py-2">{v.sku}</td>
                <td className="py-2">{formatPrice(v.price_cents)}</td>
                <td className="py-2">{v.stock_qty}</td>
                <td className="py-2">
                  {Object.entries(v.attributes || {}).map(([k, val]) => `${k}: ${val}`).join(', ') || '—'}
                </td>
                <td className="py-2">
                  <button onClick={() => handleDeleteVariant(v.id)} className="text-red-600 underline underline-offset-2">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form onSubmit={handleAddVariant} className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-xs text-[var(--color-muted)] block mb-1">SKU</label>
          <input value={sku} onChange={(e) => setSku(e.target.value)} className="border border-[var(--color-line)] rounded-md px-2 py-1.5 text-xs w-28 focus:outline-none focus:border-[var(--color-ink)]" required />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)] block mb-1">Price (cents)</label>
          <input type="number" value={priceCents} onChange={(e) => setPriceCents(e.target.value)} className="border border-[var(--color-line)] rounded-md px-2 py-1.5 text-xs w-24 focus:outline-none focus:border-[var(--color-ink)]" required />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)] block mb-1">Stock</label>
          <input type="number" value={stockQty} onChange={(e) => setStockQty(e.target.value)} className="border border-[var(--color-line)] rounded-md px-2 py-1.5 text-xs w-20 focus:outline-none focus:border-[var(--color-ink)]" required />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)] block mb-1">Attr name</label>
          <input value={attrKey} onChange={(e) => setAttrKey(e.target.value)} placeholder="color" className="border border-[var(--color-line)] rounded-md px-2 py-1.5 text-xs w-20 focus:outline-none focus:border-[var(--color-ink)]" />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)] block mb-1">Attr value</label>
          <input value={attrValue} onChange={(e) => setAttrValue(e.target.value)} placeholder="blue" className="border border-[var(--color-line)] rounded-md px-2 py-1.5 text-xs w-20 focus:outline-none focus:border-[var(--color-ink)]" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary rounded-md px-3 py-1.5 text-xs disabled:opacity-50">
          {saving ? 'Adding…' : 'Add Variant'}
        </button>
      </form>
      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  );
}

function ProductEditForm({ product, categories, token, onChange, onCancel }) {
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [description, setDescription] = useState(product.description || '');
  const [categoryId, setCategoryId] = useState(product.category_id || '');
  const [imageUrl, setImageUrl] = useState(product.image_url || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiRequest(`/products/${product.id}`, {
        method: 'PATCH',
        body: { name, slug, description, categoryId: categoryId || null, imageUrl: imageUrl || null },
        token,
      });
      onChange();
      onCancel();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="border-t border-[var(--color-line)] bg-[var(--color-pine)]/[0.04] p-4 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border border-[var(--color-line)] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--color-ink)]" required />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" className="border border-[var(--color-line)] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--color-ink)]" required />
      </div>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full border border-[var(--color-line)] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--color-ink)]" rows={2} />
      <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL" className="w-full border border-[var(--color-line)] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--color-ink)]" />
      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="border border-[var(--color-line)] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--color-ink)]">
        <option value="">No category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      {error && <p className="text-red-600 text-xs">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary rounded-md px-3 py-1.5 text-xs disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary rounded-md px-3 py-1.5 text-xs">
          Cancel
        </button>
      </div>
    </form>
  );
}