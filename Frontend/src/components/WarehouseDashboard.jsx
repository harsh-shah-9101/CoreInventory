import React, { useState, useEffect, useCallback } from 'react';
import KPICard from './KPICard';
import FilterBar from './FilterBar';
import StatusDropdown from './StatusDropdown';
import api from '../services/api';

const WAREHOUSE_STATUSES_TRANSFER = ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];
const WAREHOUSE_STATUSES_DELIVERY = ['Done', 'Canceled'];
const WAREHOUSE_STATUSES_ADJ      = ['Draft', 'Done', 'Canceled'];

const TYPE_COLORS = {
  Transfer:   'bg-cyan-900/50 text-cyan-300',
  Adjustment: 'bg-pink-900/50 text-pink-300',
  Delivery:   'bg-orange-900/50 text-orange-300',
};

const getAllowedStatuses = (type) => {
  if (type === 'Transfer')   return WAREHOUSE_STATUSES_TRANSFER;
  if (type === 'Delivery')   return WAREHOUSE_STATUSES_DELIVERY;
  if (type === 'Adjustment') return WAREHOUSE_STATUSES_ADJ;
  return [];
};

const getApiType = (type) => {
  if (type === 'Transfer')   return 'transfers';
  if (type === 'Delivery')   return 'deliveries';
  if (type === 'Adjustment') return 'adjustments';
  return '';
};

const WarehouseDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [ops, setOps]     = useState([]);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (filters.status)      params.status      = filters.status;
      if (filters.warehouseId) params.warehouseId = filters.warehouseId;
      if (filters.categoryId)  params.categoryId  = filters.categoryId;

      const [trf, adj, del] = await Promise.all([
        api.get('/dashboard/stats', { params: { ...params, docType: 'Internal' } }),
        api.get('/dashboard/stats', { params: { ...params, docType: 'Adjustments' } }),
        api.get('/dashboard/stats', { params: { ...params, docType: 'Delivery' } }),
      ]);

      setData(trf.data);
      const combined = [
        ...trf.data.operations,
        ...adj.data.operations,
        ...del.data.operations.filter(o => o.status === 'Ready'), // staff only picks Ready deliveries
      ];
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
    { key: 'scheduledTransfers', title: 'Transfers Scheduled', icon: '🔄', color: '#8b5cf6' },
    { key: 'outOfStock',         title: 'Out of Stock',        icon: '🚫', color: '#ef4444' },
    { key: 'pendingDeliveries',  title: 'Pending Deliveries',  icon: '🚚', color: '#3b82f6' },
    { key: 'lowStock',           title: 'Low Stock Items',     icon: '⚠️', color: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen bg-[#13131f] text-[#e2e2f0] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-[#10b981]/20 text-[#10b981] text-xs font-semibold px-3 py-1 rounded-full border border-[#10b981]/30">
              🏭 Warehouse Staff
            </span>
            <span className="text-[#6b6b8a] text-sm">Welcome, {user.name}</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Warehouse Dashboard</h1>
          <p className="text-[#a0a0b8] text-sm mt-1">Transfers, picking &amp; adjustments — update status below</p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-sm font-medium transition-colors">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-red-900/40 border border-red-700 text-red-300 rounded-xl text-sm">{error}</div>}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {KPI_CONFIG.map(({ key, title, icon, color }) => (
          <KPICard key={key} title={title} value={loading ? '—' : (data?.kpis?.[key] ?? 0)} icon={icon} color={color} />
        ))}
      </div>

      {/* Filters */}
      <FilterBar filters={filters} setFilters={setFilters} warehouses={data?.warehouses || []} categories={data?.categories || []} />

      {/* Operations Table */}
      <div className="bg-[#1e1e2e] rounded-xl shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2a2a3e] flex items-center justify-between">
          <h2 className="font-semibold text-[#c0c0d8]">Transfers, Adjustments &amp; Pick-up</h2>
          <span className="text-xs text-[#6b6b8a]">{ops.length} records</span>
        </div>
        {loading ? (
          <div className="p-10 text-center"><div className="w-8 h-8 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-[#a0a0b8] text-sm">Loading...</p></div>
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
                    <td className="px-5 py-3 text-right text-[#e2e2f0] font-semibold">{op.qty > 0 ? `+${op.qty}` : op.qty}</td>
                    <td className="px-5 py-3 text-[#a0a0b8]">{op.warehouse}</td>
                    <td className="px-5 py-3">
                      <StatusDropdown
                        type={getApiType(op.type)}
                        id={op.id}
                        currentStatus={op.status}
                        allowedStatuses={getAllowedStatuses(op.type)}
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

export default WarehouseDashboard;
