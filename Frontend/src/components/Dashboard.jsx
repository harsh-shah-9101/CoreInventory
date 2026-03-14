import React, { useState, useEffect, useCallback } from 'react';
import KPICard from './KPICard';
import FilterBar from './FilterBar';
import OperationsTable from './OperationsTable';
import Sidebar from './Sidebar';
import api from '../services/api';
import { Package, AlertTriangle, XCircle, Download, Truck, ArrowLeftRight, RefreshCw } from 'lucide-react';

const KPI_CONFIG = [
  { key: 'totalProducts',      title: 'Products in Stock',    icon: Package,          color: '#6c63ff', subtitle: 'Active SKUs with qty > 0' },
  { key: 'lowStock',           title: 'Low Stock Items',       icon: AlertTriangle,     color: '#f59e0b', subtitle: 'Below reorder level' },
  { key: 'outOfStock',         title: 'Out of Stock',          icon: XCircle,           color: '#ef4444', subtitle: 'Qty = 0' },
  { key: 'pendingReceipts',    title: 'Pending Receipts',      icon: Download,          color: '#10b981', subtitle: 'Not yet Done/Canceled' },
  { key: 'pendingDeliveries',  title: 'Pending Deliveries',    icon: Truck,             color: '#3b82f6', subtitle: 'Not yet Done/Canceled' },
  { key: 'scheduledTransfers', title: 'Transfers Scheduled',   icon: ArrowLeftRight,    color: '#8b5cf6', subtitle: 'Internal moves pending' },
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
    } catch {
      setError('Failed to load dashboard data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: '100dvh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: '#FAFAFA' }}>

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Inventory Dashboard</h1>
            <p className="page-subtitle">Live snapshot of your inventory operations</p>
          </div>
          <button className="btn-secondary btn-sm" onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={13} strokeWidth={2} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && <div className="alert-error">{error}</div>}

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
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
        <div className="card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E4E4E7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#09090B' }}>Recent Operations</h2>
            {!loading && data && (
              <span style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>{data.operations.length} records</span>
            )}
          </div>
          <OperationsTable operations={data?.operations || []} loading={loading} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
