import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ReorderingRules = () => {
  const [rules, setRules] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product: '', min_qty: 0, max_qty: 0, reorder_qty: 0 });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [rulesRes, prodsRes] = await Promise.all([
        api.get('/products/reorder-rules'),
        api.get('/products')
      ]);
      setRules(rulesRes.data?.rules || rulesRes.data || []);
      setProducts(prodsRes.data?.products || prodsRes.data || []);
    } catch { setError('Failed to load data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      await api.post('/products/reorder-rules', form);
      setSuccess('Rule created/updated!');
      setShowForm(false);
      setForm({ product: '', min_qty: 0, max_qty: 0, reorder_qty: 0 });
      fetchData();
    } catch { setError('Failed to create rule.'); }
    finally { setSaving(false); }
  };

  const inputClass = 'w-full bg-[#2a2a3e] border border-[#3a3a55] text-[#e2e2f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] transition-colors';

  return (
    <div className="p-6 text-[#e2e2f0]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reordering Rules</h1>
          <p className="text-[#a0a0b8] text-sm mt-1">Define automatic reorder triggers for low-stock products</p>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          className="px-4 py-2 bg-[#6c63ff] hover:bg-[#5a52e0] text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? '✕ Cancel' : '＋ New Rule'}
        </button>
      </div>

      {error   && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-900/40 border border-green-700 text-green-300 rounded-lg text-sm">{success}</div>}

      {showForm && (
        <div className="bg-[#1e1e2e] rounded-xl p-5 mb-6 border border-[#2a2a3e]">
          <h2 className="font-semibold mb-4 text-[#c0c0d8]">New Reordering Rule</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <select className={`${inputClass} col-span-2`} value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} required>
              <option value="">Select Product...</option>
              {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <div><label className="text-xs text-[#6b6b8a] mb-1 block">Min Qty</label><input className={inputClass} type="number" min="0" value={form.min_qty} onChange={e => setForm(f => ({ ...f, min_qty: +e.target.value }))} /></div>
            <div><label className="text-xs text-[#6b6b8a] mb-1 block">Max Qty</label><input className={inputClass} type="number" min="0" value={form.max_qty} onChange={e => setForm(f => ({ ...f, max_qty: +e.target.value }))} /></div>
            <div><label className="text-xs text-[#6b6b8a] mb-1 block">Reorder Qty</label><input className={inputClass} type="number" min="0" value={form.reorder_qty} onChange={e => setForm(f => ({ ...f, reorder_qty: +e.target.value }))} /></div>
            <button type="submit" disabled={saving} className="self-end px-4 py-2 bg-[#6c63ff] hover:bg-[#5a52e0] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Rule'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-[#2a2a3e]">
        <div className="px-5 py-4 border-b border-[#2a2a3e] flex items-center justify-between">
          <h2 className="font-semibold text-[#c0c0d8]">Active Rules</h2>
          <span className="text-xs text-[#6b6b8a]">{rules.length} rules</span>
        </div>
        {loading ? (
          <div className="p-10 text-center"><div className="w-8 h-8 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-[#a0a0b8] text-sm">Loading…</p></div>
        ) : rules.length === 0 ? (
          <div className="p-10 text-center"><p className="text-4xl mb-2">🔁</p><p className="text-[#a0a0b8]">No reordering rules. Create your first rule.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#16162a] text-[#a0a0b8] text-xs uppercase">
                <th className="px-5 py-4 text-left">Product</th>
                <th className="px-5 py-4 text-right">Min Qty</th>
                <th className="px-5 py-4 text-right">Max Qty</th>
                <th className="px-5 py-4 text-right">Reorder Qty</th>
                <th className="px-5 py-4 text-left">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-[#2a2a3e]">
                {rules.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-[#252538] transition-colors">
                    <td className="px-5 py-3 font-medium text-[#e2e2f0]">{r.product || r.product_name || '—'}</td>
                    <td className="px-5 py-3 text-right text-[#a0a0b8]">{r.min_qty ?? '—'}</td>
                    <td className="px-5 py-3 text-right text-[#a0a0b8]">{r.max_qty ?? '—'}</td>
                    <td className="px-5 py-3 text-right text-[#6c63ff] font-semibold">{r.reorder_qty ?? '—'}</td>
                    <td className="px-5 py-3"><span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-xs font-semibold">Active</span></td>
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

export default ReorderingRules;
