import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

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
      await api.post('/categories', form);
      setSuccess('Category created!');
      setShowForm(false);
      setForm({ name: '', description: '' });
      fetchCategories();
    } catch { setError('Failed to create category.'); }
    finally { setSaving(false); }
  };

  const inputClass = 'w-full bg-[#2a2a3e] border border-[#3a3a55] text-[#e2e2f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] transition-colors';

  return (
    <div className="p-6 text-[#e2e2f0]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Categories</h1>
          <p className="text-[#a0a0b8] text-sm mt-1">Organize products into logical groups</p>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          className="px-4 py-2 bg-[#6c63ff] hover:bg-[#5a52e0] text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? '✕ Cancel' : '＋ New Category'}
        </button>
      </div>

      {error   && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-900/40 border border-green-700 text-green-300 rounded-lg text-sm">{success}</div>}

      {showForm && (
        <div className="bg-[#1e1e2e] rounded-xl p-5 mb-6 border border-[#2a2a3e]">
          <h2 className="font-semibold mb-4 text-[#c0c0d8]">New Category</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input className={inputClass} placeholder="Category Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <input className={inputClass} placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <button type="submit" disabled={saving} className="self-start px-4 py-2 bg-[#6c63ff] hover:bg-[#5a52e0] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : 'Create Category'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-10 text-center bg-[#1e1e2e] rounded-xl border border-[#2a2a3e]">
            <div className="w-8 h-8 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#a0a0b8] text-sm">Loading…</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-3 p-10 text-center bg-[#1e1e2e] rounded-xl border border-[#2a2a3e]">
            <p className="text-4xl mb-2">🏷️</p>
            <p className="text-[#a0a0b8]">No categories yet. Create your first one!</p>
          </div>
        ) : categories.map((cat, i) => (
          <div key={cat.id || i} className="bg-[#1e1e2e] rounded-xl p-4 border border-[#2a2a3e] hover:border-[#6c63ff]/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏷️</span>
              <h3 className="font-semibold text-[#e2e2f0]">{cat.name}</h3>
            </div>
            {cat.description && <p className="text-[#a0a0b8] text-xs">{cat.description}</p>}
            <p className="text-[#6b6b8a] text-xs mt-2">{cat.product_count ?? 0} products</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCategories;
