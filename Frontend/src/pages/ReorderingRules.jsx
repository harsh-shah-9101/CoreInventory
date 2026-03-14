import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Plus, X, Pencil, RefreshCw, InboxIcon } from 'lucide-react';

const ReorderingRules = () => {
  const [rules, setRules]       = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ id: null, productId: '', minQty: '', maxQty: '', reorderQty: '' });
  const [saving, setSaving]     = useState(false);

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [rulesRes, prodRes] = await Promise.all([
        api.get('/reorder-rules'),
        api.get('/products'),
      ]);
      setRules(rulesRes.data?.rules || rulesRes.data || []);
      setProducts(prodRes.data?.products || prodRes.data || []);
    } catch { setError('Failed to load reordering rules.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (form.id) {
        await api.put(`/reorder-rules/${form.id}`, form);
      } else {
        await api.post('/reorder-rules', form);
      }
      setShowForm(false);
      setForm({ id: null, productId: '', minQty: '', maxQty: '', reorderQty: '' });
      fetchData();
    } catch { setError('Failed to save rule.'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: '100dvh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: '#FAFAFA' }}>

        <div className="page-header">
          <div>
            <h1 className="page-title">Reordering Rules</h1>
            <p className="page-subtitle">Automate reorder triggers based on stock thresholds</p>
          </div>
          <button
            className="btn-primary btn-sm"
            onClick={() => { setShowForm(f => !f); if (showForm) setForm({ id: null, productId: '', minQty: '', maxQty: '', reorderQty: '' }); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {showForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> New Rule</>}
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '14px' }}>{form.id ? 'Edit Rule' : 'New Rule'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Product</label>
                <select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))} required>
                  <option value="">Select product…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div><label className="form-label">Min Qty</label><input type="number" placeholder="10" value={form.minQty} onChange={e => setForm(f => ({ ...f, minQty: e.target.value }))} min="0" required /></div>
              <div><label className="form-label">Reorder Qty</label><input type="number" placeholder="50" value={form.reorderQty} onChange={e => setForm(f => ({ ...f, reorderQty: e.target.value }))} min="1" required /></div>
              <div><label className="form-label">Max Qty</label><input type="number" placeholder="200" value={form.maxQty} onChange={e => setForm(f => ({ ...f, maxQty: e.target.value }))} min="0" /></div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : (form.id ? 'Update Rule' : 'Create Rule')}</button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E4E4E7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Active Rules</h2>
            <span style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>{rules.length} rules</span>
          </div>
          {loading ? (
            <div className="loading-state"><div className="spinner" /><p>Loading…</p></div>
          ) : rules.length === 0 ? (
            <div className="empty-state"><RefreshCw size={32} strokeWidth={1} /><p>No reorder rules yet.</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-right">Min Qty</th>
                    <th className="text-right">Reorder Qty</th>
                    <th className="text-right">Max Qty</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r, i) => (
                    <tr key={r.id || i}>
                      <td style={{ fontWeight: 500 }}>{r.product_name || r.name || '—'}</td>
                      <td className="text-right" style={{ fontFamily: 'var(--font-mono)' }}>{r.min_qty ?? r.minQty ?? '—'}</td>
                      <td className="text-right" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.reorder_qty ?? r.reorderQty ?? '—'}</td>
                      <td className="text-right" style={{ fontFamily: 'var(--font-mono)' }}>{r.max_qty ?? r.maxQty ?? '—'}</td>
                      <td className="text-right">
                        <button className="btn-secondary btn-sm" onClick={() => { setForm({ id: r.id, productId: r.product_id || '', minQty: r.min_qty || '', maxQty: r.max_qty || '', reorderQty: r.reorder_qty || '' }); setShowForm(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Pencil size={10} strokeWidth={2} />Edit
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

export default ReorderingRules;
