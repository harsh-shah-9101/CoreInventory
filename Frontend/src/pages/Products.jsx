import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', sku: '', category: '', qty: 0, price: 0, unit_of_measure: 'Units' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchProductsAndCategories = async () => {
    setLoading(true); setError('');
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data?.products || prodRes.data || []);
      setCategories(catRes.data?.categories || catRes.data || []);
    } catch {
      setError('Failed to load data. Make sure the backend is running.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProductsAndCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      if (form.id) {
        await api.put(`/products/${form.id}`, form);
        setSuccess('Product updated successfully!');
      } else {
        await api.post('/products', form);
        setSuccess('Product created successfully!');
      }
      setShowForm(false);
      setForm({ id: null, name: '', sku: '', category: '', qty: 0, price: 0, unit_of_measure: 'Units' });
      fetchProductsAndCategories();
    } catch { setError('Failed to save product.'); }
    finally { setSaving(false); }
  };

  const inputClass = 'w-full bg-[#2a2a3e] border border-[#3a3a55] text-[#e2e2f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] transition-colors';

  return (
    <div className="p-6 text-[#e2e2f0]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-[#a0a0b8] text-sm mt-1">Create, update and manage your product catalog</p>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          className="px-4 py-2 bg-[#6c63ff] hover:bg-[#5a52e0] text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? '✕ Cancel' : '＋ New Product'}
        </button>
      </div>

      {error   && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-900/40 border border-green-700 text-green-300 rounded-lg text-sm">{success}</div>}

      {/* Create Form */}
      {showForm && (
        <div className="bg-[#1e1e2e] rounded-xl p-5 mb-6 border border-[#2a2a3e]">
          <h2 className="font-semibold mb-4 text-[#c0c0d8]">{form.id ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input className={inputClass} placeholder="Product Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <input className={inputClass} placeholder="SKU" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} required />
            
            <select className={inputClass} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Select Category...</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <input className={inputClass} placeholder="Quantity" type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: +e.target.value }))} min="0" />
            <input className={inputClass} placeholder="Unit of Measure (e.g. kg, pieces, mg)" value={form.unit_of_measure} onChange={e => setForm(f => ({ ...f, unit_of_measure: e.target.value }))} required />
            <input className={inputClass} placeholder="Price" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} min="0" step="0.01" />
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#6c63ff] hover:bg-[#5a52e0] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : (form.id ? 'Update Product' : 'Create Product')}
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-[#2a2a3e]">
        <div className="px-5 py-4 border-b border-[#2a2a3e] flex items-center justify-between">
          <h2 className="font-semibold text-[#c0c0d8]">All Products</h2>
          <span className="text-xs text-[#6b6b8a]">{products.length} items</span>
        </div>
        {loading ? (
          <div className="p-10 text-center"><div className="w-8 h-8 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-[#a0a0b8] text-sm">Loading…</p></div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center"><p className="text-4xl mb-2">📦</p><p className="text-[#a0a0b8]">No products yet. Create your first one!</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#16162a] text-[#a0a0b8] text-xs uppercase">
                <th className="px-5 py-4 text-left">Name</th>
                <th className="px-5 py-4 text-left">SKU</th>
                <th className="px-5 py-4 text-left">Category</th>
                <th className="px-5 py-4 text-right">Qty</th>
                <th className="px-5 py-4 text-left">UOM</th>
                <th className="px-5 py-4 text-right">Price</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-[#2a2a3e]">
                {products.map((p, i) => (
                  <tr key={p.id || i} className="hover:bg-[#252538] transition-colors">
                    <td className="px-5 py-3 font-medium text-[#e2e2f0]">{p.name}</td>
                    <td className="px-5 py-3 font-mono text-[#a89eff] text-xs">{p.sku || '—'}</td>
                    <td className="px-5 py-3 text-[#a0a0b8]">{p.category || '—'}</td>
                    <td className="px-5 py-3 text-right text-[#e2e2f0] font-semibold">{p.qty ?? p.qty_on_hand ?? p.quantity ?? '—'}</td>
                    <td className="px-5 py-3 text-left text-[#a0a0b8] text-xs">{p.unit_of_measure || 'Units'}</td>
                    <td className="px-5 py-3 text-right text-[#a0a0b8]">{p.price != null ? `$${(+p.price).toFixed(2)}` : '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => {
                          setForm({ id: p.id, name: p.name, sku: p.sku, category: p.category || '', qty: p.qty_on_hand ?? 0, price: p.price ?? 0, unit_of_measure: p.unit_of_measure || 'Units' });
                          setShowForm(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-2 py-1 text-xs bg-[#2a2a3e] hover:bg-[#3a3a55] text-[#a0a0b8] rounded transition-all"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
