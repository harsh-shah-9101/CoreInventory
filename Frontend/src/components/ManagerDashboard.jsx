import React, { useState, useEffect, useCallback } from 'react';
import KPICard from './KPICard';
import FilterBar from './FilterBar';
import StatusDropdown from './StatusDropdown';
import api from '../services/api';

const MANAGER_STATUSES = ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];
const TYPE_COLORS = {
  Receipt:  'bg-purple-900/50 text-purple-300',
  Delivery: 'bg-orange-900/50 text-orange-300',
};

const ManagerDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ docType: '' });
  const [ops, setOps]         = useState([]);
  const [error, setError]     = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (filters.status)      params.status      = filters.status;
      if (filters.warehouseId) params.warehouseId = filters.warehouseId;
      if (filters.categoryId)  params.categoryId  = filters.categoryId;

      // Managers see receipts and deliveries — fetch both
      const [rec, del] = await Promise.all([
        api.get('/dashboard/stats', { params: { ...params, docType: 'Receipts' } }),
        api.get('/dashboard/stats', { params: { ...params, docType: 'Delivery' } }),
      ]);

      setData(rec.data); // use first response for KPIs & dropdowns
      const combined = [...rec.data.operations, ...del.data.operations];
      combined.sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date));
      setOps(combined);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusUpdate = (id, newStatus, type) => {
    setOps(prev => prev.map(op =>
      op.id === id && op.type === type ? { ...op, status: newStatus } : op
    ));
  };

  const KPI_CONFIG = [
    { key: 'totalProducts',     title: 'Products in Stock', icon: '📦', color: '#6c63ff' },
    { key: 'lowStock',          title: 'Low Stock',          icon: '⚠️', color: '#f59e0b' },
    { key: 'outOfStock',        title: 'Out of Stock',       icon: '🚫', color: '#ef4444' },
    { key: 'pendingReceipts',   title: 'Pending Receipts',   icon: '📥', color: '#10b981' },
    { key: 'pendingDeliveries', title: 'Pending Deliveries', icon: '🚚', color: '#3b82f6' },
  ];

  return (
    <div className="min-h-screen bg-[#13131f] text-[#e2e2f0] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-[#6c63ff]/20 text-[#6c63ff] text-xs font-semibold px-3 py-1 rounded-full border border-[#6c63ff]/30">
              📋 Inventory Manager
            </span>
            <span className="text-[#6b6b8a] text-sm">Welcome, {user.name}</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Manager Dashboard</h1>
          <p className="text-[#a0a0b8] text-sm mt-1">Manage receipts &amp; deliveries — update statuses below</p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 bg-[#6c63ff] hover:bg-[#5a52e0] text-white rounded-lg text-sm font-medium transition-colors">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-red-900/40 border border-red-700 text-red-300 rounded-xl text-sm">{error}</div>}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {KPI_CONFIG.map(({ key, title, icon, color }) => (
          <KPICard key={key} title={title} value={loading ? '—' : (data?.kpis?.[key] ?? 0)} icon={icon} color={color} />
        ))}
      </div>

      {/* Filters */}
      <FilterBar filters={filters} setFilters={setFilters} warehouses={data?.warehouses || []} categories={data?.categories || []} />

      {/* Operations Table */}
      <div className="bg-[#1e1e2e] rounded-xl shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2a2a3e] flex items-center justify-between">
          <h2 className="font-semibold text-[#c0c0d8]">Receipts &amp; Deliveries</h2>
          <span className="text-xs text-[#6b6b8a]">{ops.length} records</span>
        </div>
        {loading ? (
          <div className="p-10 text-center"><div className="w-8 h-8 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-[#a0a0b8] text-sm">Loading...</p></div>
        ) : ops.length === 0 ? (
          <div className="p-10 text-center"><p className="text-4xl mb-2">📭</p><p className="text-[#a0a0b8]">No operations found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#16162a] text-[#a0a0b8] text-xs uppercase">
                <th className="px-5 py-4 text-left">Reference</th>
                <th className="px-5 py-4 text-left">Type</th>
                <th className="px-5 py-4 text-left">Product</th>
                <th className="px-5 py-4 text-right">Qty</th>
                <th className="px-5 py-4 text-left">Warehouse</th>
                <th className="px-5 py-4 text-left">Status</th>
                <th className="px-5 py-4 text-left">Scheduled</th>
              </tr></thead>
              <tbody className="divide-y divide-[#2a2a3e]">
                {ops.map((op, idx) => (
                  <tr key={`${op.type}-${op.id}-${idx}`} className="hover:bg-[#252538] transition-colors">
                    <td className="px-5 py-3 font-mono text-[#c0c0d8] font-medium">{op.reference}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${TYPE_COLORS[op.type] || 'bg-gray-700 text-gray-300'}`}>{op.type}</span>
                    </td>
                    <td className="px-5 py-3 text-[#e2e2f0]">{op.product}</td>
                    <td className="px-5 py-3 text-right text-[#e2e2f0] font-semibold">{op.qty}</td>
                    <td className="px-5 py-3 text-[#a0a0b8]">{op.warehouse}</td>
                    <td className="px-5 py-3">
                      <StatusDropdown
                        type={op.type === 'Receipt' ? 'receipts' : 'deliveries'}
                        id={op.id}
                        currentStatus={op.status}
                        allowedStatuses={MANAGER_STATUSES}
                        onUpdated={(id, status) => handleStatusUpdate(id, status, op.type)}
                      />
                    </td>
                    <td className="px-5 py-3 text-[#6b6b8a] text-xs">
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

export default ManagerDashboard;
