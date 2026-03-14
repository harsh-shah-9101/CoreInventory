import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Plus, X, Pencil, InboxIcon, Package } from 'lucide-react';

const Products = () => {
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ id: null, name: '', sku: '', category: '', qty: 0, price: 0, unit_of_measure: 'Units' });
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState('');

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
        setSuccess('Product updated successfully.');
      } else {
        await api.post('/products', form);
        setSuccess('Product created successfully.');
      }
      setShowForm(false);
      setForm({ id: null, name: '', sku: '', category: '', qty: 0, price: 0, unit_of_measure: 'Units' });
      fetchProductsAndCategories();
    } catch { setError('Failed to save product.'); }
    finally { setSaving(false); }
  };

  const openEdit = (p) => {
    setForm({ id: p.id, name: p.name, sku: p.sku, category: p.category || '', qty: p.qty_on_hand ?? 0, price: p.price ?? 0, unit_of_measure: p.unit_of_measure || 'Units' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: '100dvh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: '#FAFAFA' }}>

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Products</h1>
            <p className="page-subtitle">Create, update and manage your product catalog</p>
          </div>
          <button
            className="btn-primary btn-sm"
            onClick={() => { setShowForm(f => !f); if (showForm) setForm({ id: null, name: '', sku: '', category: '', qty: 0, price: 0, unit_of_measure: 'Units' }); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {showForm ? <><X size={13} strokeWidth={2} /> Cancel</> : <><Plus size={13} strokeWidth={2} /> New Product</>}
          </button>
        </div>

        {error   && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        {/* Inline form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#09090B', marginBottom: '16px' }}>
              {form.id ? 'Edit Product' : 'New Product'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="form-label">Product Name</label>
                <input placeholder="e.g. Paracetamol 500mg" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="form-label">SKU</label>
                <input placeholder="e.g. PARA-500" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} required />
              </div>
              <div>
                <label className="form-label">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Unit of Measure</label>
                <input placeholder="e.g. kg, pieces, mg" value={form.unit_of_measure} onChange={e => setForm(f => ({ ...f, unit_of_measure: e.target.value }))} required />
              </div>
              <div>
                <label className="form-label">Quantity</label>
                <input type="number" placeholder="0" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: +e.target.value }))} min="0" />
              </div>
              <div>
                <label className="form-label">Price ($)</label>
                <input type="number" placeholder="0.00" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} min="0" step="0.01" />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button type="button" className="btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Saving…' : (form.id ? 'Update Product' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E4E4E7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#09090B' }}>All Products</h2>
            <span style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>{products.length} items</span>
          </div>

          {loading ? (
            <div className="loading-state"><div className="spinner" /><p>Loading products…</p></div>
          ) : products.length === 0 ? (
            <div className="empty-state"><Package size={32} strokeWidth={1} /><p>No products yet. Create your first one!</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th className="text-right">Qty</th>
                    <th>UOM</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.id || i}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td className="mono" style={{ color: '#7C3AED' }}>{p.sku || '—'}</td>
                      <td className="muted">{p.category || '—'}</td>
                      <td className="text-right" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.qty ?? p.qty_on_hand ?? p.quantity ?? '—'}</td>
                      <td className="muted" style={{ fontSize: '0.8rem' }}>{p.unit_of_measure || 'Units'}</td>
                      <td className="text-right muted">{p.price != null ? `$${(+p.price).toFixed(2)}` : '—'}</td>
                      <td className="text-right">
                        <button className="btn-secondary btn-sm" onClick={() => openEdit(p)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Pencil size={11} strokeWidth={2} />
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
      </main>
    </div>
  );
};

export default Products;
