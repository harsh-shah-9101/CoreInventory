import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Plus, X, Pencil, Tag } from 'lucide-react';

const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ id: null, name: '', description: '' });
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState('');

  const fetchCategories = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/categories');
      setCategories(res.data?.categories || res.data || []);
    } catch { setError('Failed to load categories.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      if (form.id) {
        await api.put(`/categories/${form.id}`, form);
        setSuccess('Category updated.');
      } else {
        await api.post('/categories', form);
        setSuccess('Category created.');
      }
      setShowForm(false);
      setForm({ id: null, name: '', description: '' });
      fetchCategories();
    } catch { setError('Failed to save category.'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: '100dvh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: '#FAFAFA' }}>

        <div className="page-header">
          <div>
            <h1 className="page-title">Product Categories</h1>
            <p className="page-subtitle">Organize products into logical groups</p>
          </div>
          <button
            className="btn-primary btn-sm"
            onClick={() => { setShowForm(f => !f); if (showForm) setForm({ id: null, name: '', description: '' }); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {showForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> New Category</>}
          </button>
        </div>

        {error   && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '14px' }}>{form.id ? 'Edit Category' : 'New Category'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '480px' }}>
              <div><label className="form-label">Category Name</label><input placeholder="e.g. Electronics" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label className="form-label">Description (optional)</label><input placeholder="Brief description…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : (form.id ? 'Update' : 'Create')}</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading-state"><div className="spinner" /><p>Loading categories…</p></div>
        ) : categories.length === 0 ? (
          <div className="empty-state"><Tag size={32} strokeWidth={1} /><p>No categories yet. Create your first one!</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {categories.map((cat, i) => (
              <div
                key={cat.id || i}
                className="card"
                style={{ padding: '16px 20px', cursor: 'default' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', background: '#F5F3FF', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Tag size={14} color="#7C3AED" strokeWidth={1.5} />
                    </div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#09090B' }}>{cat.name}</h3>
                  </div>
                  <button
                    onClick={() => { setForm({ id: cat.id, name: cat.name, description: cat.description || '' }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 8px', height: '24px', fontSize: '0.72rem' }}
                  >
                    <Pencil size={10} strokeWidth={2} />Edit
                  </button>
                </div>
                {cat.description && <p style={{ fontSize: '0.8rem', color: '#71717A', marginBottom: '8px' }}>{cat.description}</p>}
                <p style={{ fontSize: '0.72rem', color: '#A1A1AA' }}>{cat.product_count ?? 0} products</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductCategories;
