'use client';

import { useEffect, useState } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/format';
import { Input, Textarea, Select } from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';

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

  if (loading) return <div className="skeleton h-64 rounded-lg"></div>;

  return (
    <div>
      <h2 className="font-display text-2xl mb-6">Products</h2>

      {error && <Alert className="mb-4">{error}</Alert>}
      {successMessage && <Alert tone="success" className="mb-4">{successMessage}</Alert>}

      <form onSubmit={handleCreate} className="card rounded-lg p-5 mb-8 space-y-3">
        <h3 className="font-medium text-sm">Add new product</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input type="text" placeholder="Slug (e.g. blue-hoodie)" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
        <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <Input type="text" placeholder="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">No category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </Select>
        <Button type="submit" disabled={creating} size="sm">
          {creating ? 'Creating…' : 'Create Product'}
        </Button>
      </form>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-md" style={{ background: 'var(--color-pine-light)' }}>
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button variant="secondary" size="sm" onClick={() => handleBulkStatus('active')}>Publish</Button>
          <Button variant="secondary" size="sm" onClick={() => handleBulkStatus('draft')}>Unpublish</Button>
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
          <div key={product.id} className="card rounded-lg overflow-hidden">
            <div className="flex flex-wrap justify-between items-center gap-3 p-4">
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
                <Badge tone={product.status === 'active' ? 'pine' : 'neutral'}>{product.status}</Badge>
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
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs">
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
                <tr key={v.id} className="border-t border-[var(--color-line)] hover:bg-[var(--color-surface)]">
                  <td className="py-2">{v.sku}</td>
                  <td className="py-2">{formatPrice(v.price_cents)}</td>
                  <td className="py-2">{v.stock_qty}</td>
                  <td className="py-2">
                    {Object.entries(v.attributes || {}).map(([k, val]) => `${k}: ${val}`).join(', ') || '—'}
                  </td>
                  <td className="py-2">
                    <button onClick={() => handleDeleteVariant(v.id)} className="text-[var(--color-danger)] underline underline-offset-2">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={handleAddVariant} className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-xs text-[var(--color-muted)] block mb-1">SKU</label>
          <input value={sku} onChange={(e) => setSku(e.target.value)} className="field-input px-2 py-1.5 text-xs w-28" required />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)] block mb-1">Price (cents)</label>
          <input type="number" value={priceCents} onChange={(e) => setPriceCents(e.target.value)} className="field-input px-2 py-1.5 text-xs w-24" required />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)] block mb-1">Stock</label>
          <input type="number" value={stockQty} onChange={(e) => setStockQty(e.target.value)} className="field-input px-2 py-1.5 text-xs w-20" required />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)] block mb-1">Attr name</label>
          <input value={attrKey} onChange={(e) => setAttrKey(e.target.value)} placeholder="color" className="field-input px-2 py-1.5 text-xs w-20" />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)] block mb-1">Attr value</label>
          <input value={attrValue} onChange={(e) => setAttrValue(e.target.value)} placeholder="blue" className="field-input px-2 py-1.5 text-xs w-20" />
        </div>
        <Button type="submit" disabled={saving} size="sm">
          {saving ? 'Adding…' : 'Add Variant'}
        </Button>
      </form>
      {error && <p className="text-[var(--color-danger)] text-xs mt-2">{error}</p>}
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
    <form onSubmit={handleSave} className="border-t border-[var(--color-line)] p-4 space-y-2" style={{ background: 'var(--color-pine-light)' }}>
      <div className="grid grid-cols-2 gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="field-input px-2 py-1.5 text-sm" required />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" className="field-input px-2 py-1.5 text-sm" required />
      </div>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="field-input w-full px-2 py-1.5 text-sm" rows={2} />
      <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL" className="field-input w-full px-2 py-1.5 text-sm" />
      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="field-input px-2 py-1.5 text-sm">
        <option value="">No category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      {error && <p className="text-[var(--color-danger)] text-xs">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={saving} size="sm">
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
