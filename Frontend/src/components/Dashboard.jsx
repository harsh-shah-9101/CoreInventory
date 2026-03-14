import React, { useState, useEffect, useCallback } from 'react';
import KPICard from './KPICard';
import FilterBar from './FilterBar';
import OperationsTable from './OperationsTable';
import api from '../services/api';

const KPI_CONFIG = [
  { key: 'totalProducts',     title: 'Total Products in Stock', icon: '📦', color: '#6c63ff', subtitle: 'Active SKUs with qty > 0' },
  { key: 'lowStock',          title: 'Low Stock Items',          icon: '⚠️', color: '#f59e0b', subtitle: 'Below reorder level' },
  { key: 'outOfStock',        title: 'Out of Stock',             icon: '🚫', color: '#ef4444', subtitle: 'Qty = 0' },
  { key: 'pendingReceipts',   title: 'Pending Receipts',         icon: '📥', color: '#10b981', subtitle: 'Not yet Done/Canceled' },
  { key: 'pendingDeliveries', title: 'Pending Deliveries',       icon: '🚚', color: '#3b82f6', subtitle: 'Not yet Done/Canceled' },
  { key: 'scheduledTransfers',title: 'Transfers Scheduled',      icon: '🔄', color: '#8b5cf6', subtitle: 'Internal moves pending' },
];

const Dashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [error, setError]     = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.docType)     params.docType     = filters.docType;
      if (filters.status)      params.status      = filters.status;
      if (filters.warehouseId) params.warehouseId = filters.warehouseId;
      if (filters.categoryId)  params.categoryId  = filters.categoryId;

      const res = await api.get('/dashboard/stats', { params });
      setData(res.data);
    } catch (err) {
      setError('Failed to load dashboard data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#13131f] text-[#e2e2f0] p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">📊 Inventory Dashboard</h1>
          <p className="text-[#a0a0b8] text-sm">Live snapshot of your inventory operations</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-[#6c63ff] hover:bg-[#5a52e0] text-white rounded-lg text-sm font-medium transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/40 border border-red-700 text-red-300 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {KPI_CONFIG.map(({ key, title, icon, color, subtitle }) => (
          <KPICard
            key={key}
            title={title}
            value={loading ? '—' : (data?.kpis?.[key] ?? 0)}
            icon={icon}
            color={color}
            subtitle={subtitle}
          />
        ))}
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        warehouses={data?.warehouses || []}
        categories={data?.categories || []}
      />

      {/* Operations Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#c0c0d8]">Recent Operations</h2>
          {!loading && data && (
            <span className="text-xs text-[#6b6b8a]">{data.operations.length} records</span>
          )}
        </div>
        <OperationsTable operations={data?.operations || []} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
