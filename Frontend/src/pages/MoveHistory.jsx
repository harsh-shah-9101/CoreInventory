import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Plus, X, CheckCircle, InboxIcon } from 'lucide-react';

const STATUS_STYLE = {
  Done:     { background: '#F0FDF4', color: '#15803D' },
  Ready:    { background: '#EFF6FF', color: '#1D4ED8' },
  Waiting:  { background: '#FFFBEB', color: '#B45309' },
  Draft:    { background: '#F4F4F5', color: '#52525B' },
  Canceled: { background: '#FEF2F2', color: '#B91C1C' },
};

const MoveHistory = () => {
  const [ops, setOps]             = useState([]);
  const [products, setProducts]   = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ productId: '', fromWarehouseId: '', toWarehouseId: '', qty: '', scheduledDate: new Date().toISOString().split('T')[0] });

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [recRes, prodRes, warRes] = await Promise.all([
        api.get('/transfers'),
        api.get('/products'),
        api.get('/warehouses')
      ]);
      setOps(recRes.data?.transfers || []);
      setProducts(prodRes.data?.products || []);
      setWarehouses(warRes.data?.warehouses || []);
    } catch { setError('Failed to load transfers.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/transfers', form);
      setShowForm(false);
      setForm({ ...form, qty: '', productId: '', fromWarehouseId: '', toWarehouseId: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create transfer.');
    } finally { setSaving(false); }
  };

  const handleValidate = async (id) => {
    if (!window.confirm('Validate this transfer? This will move stock between locations immediately.')) return;
    try {
      await api.post(`/transfers/${id}/validate`);
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
            <h1 className="page-title">Internal Transfers</h1>
            <p className="page-subtitle">Move stock between your warehouses and locations</p>
          </div>
          <button className="btn-primary btn-sm" onClick={() => setShowForm(f => !f)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {showForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> New Transfer</>}
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '14px' }}>Draft Internal Transfer</h2>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Product</label>
                <select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))} required>
                  <option value="">Select Product…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Source Warehouse</label>
                <select value={form.fromWarehouseId} onChange={e => setForm(f => ({ ...f, fromWarehouseId: e.target.value }))} required>
                  <option value="">Select Warehouse…</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Destination Warehouse</label>
                <select value={form.toWarehouseId} onChange={e => setForm(f => ({ ...f, toWarehouseId: e.target.value }))} required>
                  <option value="">Select Warehouse…</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Quantity</label>
                <input type="number" placeholder="0" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: +e.target.value }))} min="1" required />
              </div>
              <div>
                <label className="form-label">Scheduled Date</label>
                <input type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} required />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary btn-sm" disabled={saving}>{saving ? 'Creating…' : 'Create Draft Transfer'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E4E4E7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600 }}>All Transfers</h2>
            <span style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>{ops.length} records</span>
          </div>
          {loading ? (
            <div className="loading-state"><div className="spinner" /><p>Loading…</p></div>
          ) : ops.length === 0 ? (
            <div className="empty-state"><InboxIcon size={32} strokeWidth={1} /><p>No transfers found.</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Product</th>
                    <th className="text-right">Qty</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ops.map((op, i) => {
                    const s = STATUS_STYLE[op.status] || STATUS_STYLE.Draft;
                    return (
                      <tr key={op.id || i}>
                        <td className="mono" style={{ color: '#1D4ED8' }}>{op.reference}</td>
                        <td style={{ fontWeight: 500 }}>{op.product_name}</td>
                        <td className="text-right" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{op.qty}</td>
                        <td className="muted">{op.from_warehouse_name}</td>
                        <td className="muted">{op.to_warehouse_name}</td>
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

export default MoveHistory;
