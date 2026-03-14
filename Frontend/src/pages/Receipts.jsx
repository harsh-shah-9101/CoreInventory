import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import FilterBar from '../components/FilterBar';
import api from '../services/api';
import { Plus, X, CheckCircle, InboxIcon } from 'lucide-react';

const STATUS_STYLE = {
  Done:     { background: '#F0FDF4', color: '#15803D' },
  Ready:    { background: '#EFF6FF', color: '#1D4ED8' },
  Waiting:  { background: '#FFFBEB', color: '#B45309' },
  Draft:    { background: '#F4F4F5', color: '#52525B' },
  Canceled: { background: '#FEF2F2', color: '#B91C1C' },
};

const Receipts = () => {
  const [ops, setOps]             = useState([]);
  const [products, setProducts]   = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ productId: '', warehouseId: '', destination_location_id: '', qty: '', scheduledDate: new Date().toISOString().split('T')[0] });
  const [filters, setFilters]     = useState({ status: '', warehouseId: '', categoryId: '' });

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [recRes, prodRes, warRes, locRes, catRes] = await Promise.all([
        api.get('/receipts'),
        api.get('/products'),
        api.get('/warehouses'),
        api.get('/locations'),
        api.get('/categories')
      ]);
      setOps(recRes.data?.receipts || []);
      setProducts(prodRes.data?.products || []);
      setWarehouses(warRes.data?.warehouses || []);
      setLocations(locRes.data?.locations || []);
      setCategories(catRes.data?.categories || catRes.data || []);
    } catch { setError('Failed to load receipts.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/receipts', form);
      setShowForm(false);
      setForm({ ...form, qty: '', productId: '' });
      fetchData();
    } catch { setError('Failed to create receipt.'); }
    finally { setSaving(false); }
  };

  const handleValidate = async (id) => {
    if (!window.confirm('Validate this receipt? This will move stock into the warehouse.')) return;
    try {
      await api.post(`/receipts/${id}/validate`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Validation failed');
    }
  };

  const filteredOps = ops.filter(op => {
    const matchStatus = !filters.status || op.status === filters.status;
    const matchWarehouse = !filters.warehouseId || String(op.warehouse_id) === String(filters.warehouseId);
    const matchCategory = !filters.categoryId || String(op.category_id) === String(filters.categoryId);
    return matchStatus && matchWarehouse && matchCategory;
  });

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: '100dvh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: '#FAFAFA' }}>

        <div className="page-header">
          <div>
            <h1 className="page-title">Receipts</h1>
            <p className="page-subtitle">Manage incoming shipments and vendor deliveries</p>
          </div>
          <button
            className="btn-primary btn-sm"
            onClick={() => setShowForm(f => !f)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {showForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> New Receipt</>}
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <FilterBar 
          filters={filters} 
          setFilters={setFilters} 
          warehouses={warehouses} 
          categories={categories} 
        />

        {showForm && (
          <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '14px' }}>Record Incoming Stock</h2>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label">Product</label>
                <select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))} required>
                  <option value="">Select Product…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Destination Warehouse</label>
                <select value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value, destination_location_id: '' }))} required>
                  <option value="">Select Warehouse…</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Destination Location (Optional)</label>
                <select value={form.destination_location_id} onChange={e => setForm(f => ({ ...f, destination_location_id: e.target.value }))} disabled={!form.warehouseId}>
                  <option value="">Top-level Warehouse</option>
                  {locations.filter(l => l.warehouse_id == form.warehouseId).map(l => (
                    <option key={l.id} value={l.id}>{l.name} {l.code !== '-' ? `(${l.code})` : ''}</option>
                  ))}
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
                <button type="submit" className="btn-primary btn-sm" disabled={saving}>{saving ? 'Creating…' : 'Create Draft Receipt'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E4E4E7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600 }}>All Receipts</h2>
            <span style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>{filteredOps.length} records</span>
          </div>
          {loading ? (
            <div className="loading-state"><div className="spinner" /><p>Loading receipts…</p></div>
          ) : filteredOps.length === 0 ? (
            <div className="empty-state"><InboxIcon size={32} strokeWidth={1} /><p>No receipts found.</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Product</th>
                    <th className="text-right">Qty</th>
                    <th>Warehouse</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Scheduled</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOps.map((op, i) => {
                    const s = STATUS_STYLE[op.status] || STATUS_STYLE.Draft;
                    return (
                      <tr key={op.id || i}>
                        <td className="mono" style={{ color: '#7C3AED' }}>{op.reference}</td>
                        <td style={{ fontWeight: 500 }}>{op.product_name}</td>
                        <td className="text-right" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{op.qty}</td>
                        <td className="muted">{op.warehouse_name}</td>
                        <td className="muted">{op.destination_location_name || '—'}</td>
                        <td><span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, ...s }}>{op.status}</span></td>
                        <td className="muted" style={{ fontSize: '0.8rem' }}>{op.scheduled_date ? new Date(op.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                        <td className="text-right">
                          {op.status !== 'Done' && (
                            <button
                              onClick={() => handleValidate(op.id)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', height: '28px', padding: '0 10px', background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              <CheckCircle size={12} strokeWidth={2.5} />
                              Validate
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

export default Receipts;
