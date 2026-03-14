import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusDropdown from '../components/StatusDropdown';

const DeliveryOrders = () => {
  const [ops, setOps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: '', warehouseId: '', qty: 1 });
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [resDel, resProd, resWh] = await Promise.all([
        api.get('/dashboard/stats', { params: { docType: 'Delivery' } }),
        api.get('/products'),
        api.get('/warehouses')
      ]);
      setOps(resDel.data?.operations || []);
      setProducts(resProd.data?.products || resProd.data || []);
      setWarehouses(resWh.data?.warehouses || resWh.data || []);
    } catch {
      setError('Failed to load delivery orders and form data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = (id, newStatus) => {
    setOps(prev => prev.map(op => op.id === id ? { ...op, status: newStatus } : op));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/deliveries', form);
      setShowForm(false);
      setForm({ productId: '', warehouseId: '', qty: 1 });
      fetchData(); // reload
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create delivery');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full bg-[#2a2a3e] border border-[#3a3a55] text-[#e2e2f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] transition-colors';

  return (
    <div className="p-6 text-[#e2e2f0]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Delivery Orders (Outgoing Stock)</h1>
          <p className="text-[#a0a0b8] text-sm mt-1">Manage outgoing shipments to customers or other locations</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#6c63ff] hover:bg-[#5a52d5] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Delivery'}
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 bg-[#1e1e2e] rounded-xl p-5 border border-[#2a2a3e]">
          <h2 className="text-lg font-semibold text-white mb-4">Create Delivery Order</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-[#a0a0b8] mb-1">Product to Deliver</label>
              <select className={inputClass} value={form.productId} onChange={e => setForm({...form, productId: e.target.value})} required>
                <option value="">-- Select Product --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.qty_on_hand})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#a0a0b8] mb-1">From Warehouse</label>
              <select className={inputClass} value={form.warehouseId} onChange={e => setForm({...form, warehouseId: e.target.value})} required>
                <option value="">-- Select Warehouse --</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#a0a0b8] mb-1">Quantity</label>
              <input type="number" className={inputClass} min="1" value={form.qty} onChange={e => setForm({...form, qty: parseInt(e.target.value)})} required />
            </div>
          </div>
          <div className="flex justify-end">
            <button disabled={saving} type="submit" className="bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Create Order'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-[#2a2a3e]">
        <div className="px-5 py-4 border-b border-[#2a2a3e] flex items-center justify-between">
          <h2 className="font-semibold text-[#c0c0d8]">Delivery Status Tracking</h2>
          <span className="text-xs text-[#6b6b8a]">{ops.length} records</span>
        </div>
        {loading ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-[#a0a0b8] text-sm">Loading…</p>
          </div>
        ) : ops.length === 0 ? (
          <div className="p-10 text-center"><p className="text-4xl mb-2">??</p><p className="text-[#a0a0b8]">No delivery orders found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#16162a] text-[#a0a0b8] text-xs uppercase">
                <th className="px-5 py-4 text-left">Reference</th>
                <th className="px-5 py-4 text-left">Product</th>
                <th className="px-5 py-4 text-right">Qty</th>
                <th className="px-5 py-4 text-left">Warehouse</th>
                <th className="px-5 py-4 text-left">Status</th>
                <th className="px-5 py-4 text-left">Scheduled</th>
              </tr></thead>
              <tbody className="divide-y divide-[#2a2a3e]">
                {ops.map((op, i) => (
                  <tr key={op.id || i} className="hover:bg-[#252538] transition-colors">
                    <td className="px-5 py-4 font-mono text-[#a89eff] font-medium">{op.reference}</td>
                    <td className="px-5 py-4 text-[#e2e2f0]">{op.product}</td>
                    <td className="px-5 py-4 text-right text-[#e2e2f0] font-semibold">{op.qty}</td>
                    <td className="px-5 py-4 text-[#a0a0b8]">{op.warehouse}</td>
                    <td className="px-5 py-4">
                      <StatusDropdown
                        type="deliveries"
                        id={op.id}
                        currentStatus={op.status}
                        allowedStatuses={['Draft', 'Waiting', 'Ready', 'Done', 'Canceled']}
                        onUpdated={handleStatusUpdate}
                      />
                    </td>
                    <td className="px-5 py-4 text-[#6b6b8a] text-xs">
                      {op.scheduled_date ? new Date(op.scheduled_date).toLocaleDateString() : '—'}
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

export default DeliveryOrders;
