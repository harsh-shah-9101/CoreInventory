import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { BookOpen } from 'lucide-react';

const MOVE_COLOR = (type, qty) => {
  if (type === 'RECEIPT' || type === 'TRANSFER_IN') return { color: '#15803D' };
  if (type === 'DELIVERY' || type === 'TRANSFER_OUT') return { color: '#B91C1C' };
  return qty > 0 ? { color: '#15803D' } : { color: '#B91C1C' };
};

const MOVE_BADGE = {
  RECEIPT:      { background: '#F0FDF4', color: '#15803D' },
  DELIVERY:     { background: '#FFF7ED', color: '#C2410C' },
  TRANSFER_IN:  { background: '#EFF6FF', color: '#1D4ED8' },
  TRANSFER_OUT: { background: '#EFF6FF', color: '#1D4ED8' },
  ADJUSTMENT:   { background: '#F5F3FF', color: '#6D28D9' },
};

const StockLedger = () => {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchLedger = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/ledger');
      setLedger(res.data?.ledger || []);
    } catch { setError('Failed to load stock ledger.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLedger(); }, []);

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: '100dvh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: '#FAFAFA' }}>

        <div className="page-header">
          <div>
            <h1 className="page-title">Stock Ledger</h1>
            <p className="page-subtitle">Immutable audit log of all inventory movements</p>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#A1A1AA', background: '#F4F4F5', padding: '4px 10px', borderRadius: '4px', border: '1px solid #E4E4E7' }}>
            Read-only
          </span>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <div className="card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E4E4E7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Movement History</h2>
            <span style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>{ledger.length} records</span>
          </div>
          {loading ? (
            <div className="loading-state"><div className="spinner" /><p>Loading audit trail…</p></div>
          ) : ledger.length === 0 ? (
            <div className="empty-state"><BookOpen size={32} strokeWidth={1} /><p>No stock movements recorded yet.</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Warehouse</th>
                    <th>Movement Type</th>
                    <th className="text-right">Qty Change</th>
                    <th>Source Document</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((entry, i) => {
                    const moveStyle = MOVE_BADGE[entry.movement_type] || { background: '#F4F4F5', color: '#52525B' };
                    const qtyStyle = MOVE_COLOR(entry.movement_type, entry.quantity);
                    const isPos = entry.quantity > 0;
                    return (
                      <tr key={entry.id || i}>
                        <td className="muted" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {new Date(entry.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ fontWeight: 500 }}>{entry.product_name}</td>
                        <td className="muted">{entry.warehouse_name}</td>
                        <td>
                          <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, fontFamily: 'var(--font-mono)', ...moveStyle }}>
                            {entry.movement_type}
                          </span>
                        </td>
                        <td className="text-right" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, ...qtyStyle }}>
                          {isPos ? `+${entry.quantity}` : entry.quantity}
                        </td>
                        <td>
                          <p style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#A1A1AA', marginBottom: '1px' }}>{entry.reference_type}</p>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#7C3AED' }}>{entry.reference_id}</p>
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

export default StockLedger;
