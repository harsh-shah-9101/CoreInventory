import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DeliveryOrders = () => {
  const [ops, setOps] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({ 
    productId: '', 
    warehouseId: '', 
    qty: '', 
    scheduledDate: new Date().toISOString().split('T')[0] 
  });

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [recRes, prodRes, warRes] = await Promise.all([
        api.get('/deliveries'),
        api.get('/products'),
        api.get('/warehouses')
      ]);
      setOps(recRes.data?.deliveries || []);
      setProducts(prodRes.data?.products || []);
      setWarehouses(warRes.data?.warehouses || []);
    } catch { 
      setError('Failed to load delivery orders.'); 
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/deliveries', form);
      setShowForm(false);
      setForm({ ...form, qty: '', productId: '' });
      fetchData();
    } catch {
      setError('Failed to create delivery order.');
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async (id) => {
    if (!window.confirm('Validate this delivery? This will deduct stock from the warehouse.')) return;
    try {
      await api.post(`/deliveries/${id}/validate`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Validation failed');
    }
  };

  const inputClass = 'w-full bg-[#2a2a3e] border border-[#3a3a55] text-[#e2e2f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] transition-colors';

  return (
    <div className="p-6 text-[#e2e2f0]">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h1 className="text-2xl font-bold text-white">Delivery Orders (Outgoing)</h1>
           <p className="text-[#a0a0b8] text-sm mt-1">Manage outbound customer orders and packing</p>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          className="px-4 py-2 bg-[#6c63ff] hover:bg-[#5a52e0] text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? '✕ Cancel' : '＋ New Delivery Order'}
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}

       {/* Create Form */}
      {showForm && (
        <div className="bg-[#1e1e2e] rounded-xl p-5 mb-6 border border-[#2a2a3e]">
          <h2 className="font-semibold mb-4 text-[#c0c0d8]">Draft Delivery Order</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            
            <select className={inputClass} value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))} required>
              <option value="">Select Product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>

             <select className={inputClass} value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))} required>
              <option value="">Source Warehouse...</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>

            <input className={inputClass} placeholder="Quantity" type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: +e.target.value }))} min="1" required />
            <input className={inputClass} type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} required />
            
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#6c63ff] hover:bg-[#5a52e0] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? 'Creating…' : 'Create Draft Delivery'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-[#2a2a3e]">
        <div className="px-5 py-4 border-b border-[#2a2a3e] flex items-center justify-between">
          <h2 className="font-semibold text-[#c0c0d8]">All Delivery Orders</h2>
          <span className="text-xs text-[#6b6b8a]">{ops.length} records</span>
        </div>
        {loading ? (
          <div className="p-10 text-center"><div className="w-8 h-8 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-[#a0a0b8] text-sm">Loading…</p></div>
        ) : ops.length === 0 ? (
          <div className="p-10 text-center"><p className="text-4xl mb-2">📤</p><p className="text-[#a0a0b8]">No deliveries found.</p></div>
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
                <th className="px-5 py-4 text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-[#2a2a3e]">
                {ops.map((op, i) => (
                  <tr key={op.id || i} className="hover:bg-[#252538] transition-colors">
                    <td className="px-5 py-4 font-mono text-[#a89eff] font-medium">{op.reference}</td>
                    <td className="px-5 py-4 text-[#e2e2f0]">{op.product_name}</td>
                    <td className="px-5 py-4 text-right text-[#e2e2f0] font-semibold">{op.qty}</td>
                    <td className="px-5 py-4 text-[#a0a0b8]">{op.warehouse_name}</td>
                    <td className="px-5 py-4">
                       <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        op.status === 'Done' ? 'bg-green-900/40 border border-green-700 text-green-300' 
                        : 'bg-yellow-900/40 border border-yellow-700 text-yellow-300'
                      }`}>
                        {op.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#6b6b8a]">
                      {op.scheduled_date ? new Date(op.scheduled_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                       {op.status !== 'Done' && (
                         <button
                          onClick={() => handleValidate(op.id)}
                          className="px-3 py-1 bg-[#6c63ff] hover:bg-[#5a52e0] text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Validate Delivery
                        </button>
                       )}
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
