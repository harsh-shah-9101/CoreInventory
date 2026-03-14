import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Plus, X, CheckCircle, InboxIcon } from 'lucide-react';

const STATUS_STYLE = {
  Done:     { background: '#F0FDF4', color: '#15803D' },
  Draft:    { background: '#F4F4F5', color: '#52525B' },
  Canceled: { background: '#FEF2F2', color: '#B91C1C' },
};

const InventoryAdjustment = () => {
  const [ops, setOps]             = useState([]);
  const [products, setProducts]   = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ productId: '', warehouseId: '', qtyChange: '', reason: '' });

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [recRes, prodRes, warRes] = await Promise.all([
        api.get('/adjustments'),
        api.get('/products'),
        api.get('/warehouses')
      ]);
      setOps(recRes.data?.adjustments || []);
      setProducts(prodRes.data?.products || []);
      setWarehouses(warRes.data?.warehouses || []);
    } catch { setError('Failed to load adjustments.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/adjustments', form);
      setShowForm(false);
      setForm({ ...form, qtyChange: '', productId: '', reason: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create adjustment.');
    } finally { setSaving(false); }
  };

  const handleValidate = async (id) => {
    if (!window.confirm('Validate this adjustment? This will permanently modify stock levels.')) return;
    try {
      await api.post(`/adjustments/${id}/validate`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Validation failed');
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: '100dvh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: '#FAFAFA' }}>

        <div className="page-header">
          <div>
            <h1 className="page-title">Stock Adjustments</h1>
            <p className="page-subtitle">Correct stock levels based on physical counts or losses</p>
          </div>
          <button className="btn-primary btn-sm" onClick={() => setShowForm(f => !f)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {showForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> New Adjustment</>}
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '14px' }}>Draft Physical Count Adjustment</h2>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label">Product</label>
                <select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))} required>
                  <option value="">Select Product…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Warehouse</label>
                <select value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))} required>
                  <option value="">Select Warehouse…</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Quantity Diff <span style={{ color: '#A1A1AA', fontWeight: 400 }}>(e.g. -5 or +10)</span></label>
                <input type="number" placeholder="-5" value={form.qtyChange} onChange={e => setForm(f => ({ ...f, qtyChange: +e.target.value }))} required />
              </div>
              <div>
                <label className="form-label">Reason</label>
                <input placeholder="e.g. Broken in transit" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary btn-sm" disabled={saving}>{saving ? 'Creating…' : 'Create Draft Adjustment'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E4E4E7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600 }}>All Adjustments</h2>
            <span style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>{ops.length} records</span>
          </div>
          {loading ? (
            <div className="loading-state"><div className="spinner" /><p>Loading…</p></div>
          ) : ops.length === 0 ? (
            <div className="empty-state"><InboxIcon size={32} strokeWidth={1} /><p>No adjustments found.</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Product</th>
                    <th className="text-right">Diff</th>
                    <th>Warehouse</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ops.map((op, i) => {
                    const s = STATUS_STYLE[op.status] || STATUS_STYLE.Draft;
                    const isPos = op.qty_change > 0;
                    return (
                      <tr key={op.id || i}>
                        <td className="mono" style={{ color: '#52525B' }}>{op.reference}</td>
                        <td style={{ fontWeight: 500 }}>{op.product_name}</td>
                        <td className="text-right" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: isPos ? '#15803D' : '#B91C1C' }}>
                          {isPos ? `+${op.qty_change}` : op.qty_change}
                        </td>
                        <td className="muted">{op.warehouse_name}</td>
                        <td className="muted" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{op.reason}</td>
                        <td><span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, ...s }}>{op.status}</span></td>
                        <td className="text-right">
                          {op.status !== 'Done' && (
                            <button onClick={() => handleValidate(op.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', height: '28px', padding: '0 10px', background: '#09090B', color: '#FFF', border: 'none', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                              <CheckCircle size={12} strokeWidth={2.5} />Validate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InventoryAdjustment;
