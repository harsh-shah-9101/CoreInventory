import React, { useState, useEffect, useCallback } from 'react';
import KPICard from './KPICard';
import FilterBar from './FilterBar';
import StatusDropdown from './StatusDropdown';
import Sidebar from './Sidebar';
import api from '../services/api';
import { ArrowLeftRight, XCircle, Truck, AlertTriangle, RefreshCw, InboxIcon } from 'lucide-react';

const WAREHOUSE_STATUSES_TRANSFER = ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];
const WAREHOUSE_STATUSES_DELIVERY = ['Done', 'Canceled'];
const WAREHOUSE_STATUSES_ADJ      = ['Draft', 'Done', 'Canceled'];

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

const TYPE_STYLE = {
  Transfer:   { background: '#EFF6FF', color: '#1D4ED8' },
  Adjustment: { background: '#F0FDF4', color: '#15803D' },
  Delivery:   { background: '#FFF7ED', color: '#C2410C' },
};

const STATUS_STYLE = {
  Done:     { background: '#F0FDF4', color: '#15803D' },
  Ready:    { background: '#EFF6FF', color: '#1D4ED8' },
  Waiting:  { background: '#FFFBEB', color: '#B45309' },
  Draft:    { background: '#F4F4F5', color: '#52525B' },
  Canceled: { background: '#FEF2F2', color: '#B91C1C' },
};

const Badge = ({ label, styleMap }) => {
  const s = styleMap[label] || { background: '#F4F4F5', color: '#52525B' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap', ...s }}>
      {label}
    </span>
  );
};

const WarehouseDashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [ops, setOps]         = useState([]);
  const [error, setError]     = useState('');

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
        ...del.data.operations.filter(o => o.status === 'Ready'),
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
    { key: 'scheduledTransfers', title: 'Transfers Scheduled', icon: ArrowLeftRight, color: '#8b5cf6' },
    { key: 'outOfStock',         title: 'Out of Stock',        icon: XCircle,        color: '#ef4444' },
    { key: 'pendingDeliveries',  title: 'Pending Deliveries',  icon: Truck,          color: '#3b82f6' },
    { key: 'lowStock',           title: 'Low Stock Items',     icon: AlertTriangle,  color: '#f59e0b' },
  ];

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: '100dvh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: '#FAFAFA' }}>

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Warehouse Dashboard</h1>
            <p className="page-subtitle">Transfers, picking & adjustments — update status below</p>
          </div>
          <button className="btn-secondary btn-sm" onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={13} strokeWidth={2} />
            Refresh
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {KPI_CONFIG.map(({ key, title, icon, color }) => (
            <KPICard key={key} title={title} value={loading ? '—' : (data?.kpis?.[key] ?? 0)} icon={icon} color={color} />
          ))}
        </div>

        {/* Filters */}
        <FilterBar filters={filters} setFilters={setFilters} warehouses={data?.warehouses || []} categories={data?.categories || []} />

        {/* Operations Table */}
        <div className="card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E4E4E7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#09090B' }}>Transfers, Adjustments & Pickup</h2>
            <span style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>{ops.length} records</span>
          </div>

          {loading ? (
            <div className="loading-state"><div className="spinner" /><p>Loading…</p></div>
          ) : ops.length === 0 ? (
            <div className="empty-state"><InboxIcon size={32} strokeWidth={1} /><p>No operations found.</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Type</th>
                    <th>Product</th>
                    <th className="text-right">Qty</th>
                    <th>Warehouse</th>
                    <th>Status</th>
                    <th>Scheduled</th>
                  </tr>
                </thead>
                <tbody>
                  {ops.map((op, idx) => (
                    <tr key={`${op.type}-${op.id}-${idx}`}>
                      <td className="mono" style={{ color: '#52525B' }}>{op.reference}</td>
                      <td><Badge label={op.type} styleMap={TYPE_STYLE} /></td>
                      <td style={{ fontWeight: 500 }}>{op.product}</td>
                      <td className="text-right" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{op.qty > 0 ? `+${op.qty}` : op.qty}</td>
                      <td className="muted">{op.warehouse}</td>
                      <td>
                        <StatusDropdown
                          type={getApiType(op.type)}
                          id={op.id}
                          currentStatus={op.status}
                          allowedStatuses={getAllowedStatuses(op.type)}
                          onUpdated={(id, status) => handleStatusUpdate(id, status, op.type)}
                        />
                      </td>
                      <td className="muted" style={{ fontSize: '0.8rem' }}>
                        {op.scheduled_date ? new Date(op.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WarehouseDashboard;
