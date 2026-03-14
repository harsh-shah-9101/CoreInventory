import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusDropdown from '../components/StatusDropdown';

const DeliveryOrders = () => {
  const [ops, setOps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDeliveries = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/dashboard/stats', { params: { docType: 'Delivery' } });
      setOps(res.data?.operations || []);
    } catch { setError('Failed to load delivery orders.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDeliveries(); }, []);

  const handleStatusUpdate = (id, newStatus) => {
    setOps(prev => prev.map(op => op.id === id ? { ...op, status: newStatus } : op));
  };

  return (
    <div className="p-6 text-[#e2e2f0]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Delivery Orders (Outgoing Stock)</h1>
        <p className="text-[#a0a0b8] text-sm mt-1">Manage outgoing shipments to customers or other locations</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}

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
          <div className="p-10 text-center"><p className="text-4xl mb-2">🚚</p><p className="text-[#a0a0b8]">No delivery orders found.</p></div>
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
