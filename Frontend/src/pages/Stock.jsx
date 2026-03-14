import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Layers } from 'lucide-react';

const Stock = () => {
  const [stockRecords, setStockRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStock = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/products/stock');
      setStockRecords(res.data?.stock || []);
    } catch {
      setError('Failed to load stock data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStock(); }, []);

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: '100dvh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: '#FAFAFA' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Stock per Location</h1>
            <p className="page-subtitle">Current stock availability distributed by warehouse and specific locations</p>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <div className="loading-state"><div className="spinner" /><p>Loading stock…</p></div>
        ) : (
          <div className="card">
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E4E4E7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#09090B' }}>Detailed Inventory</h2>
              <span style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>{stockRecords.length} records</span>
            </div>
            {stockRecords.length === 0 ? (
              <div className="empty-state"><Layers size={32} strokeWidth={1} /><p>No stock data available.</p></div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Warehouse</th>
                      <th>Location</th>
                      <th className="text-right">On Hand</th>
                      <th className="text-right">Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockRecords.map((record, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 500 }}>{record.product}</td>
                        <td className="muted">{record.warehouse || '—'}</td>
                        <td className="muted">
                           {record.location_name} {record.location_code !== '-' && `(${record.location_code})`}
                        </td>
                        <td className="text-right" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {record.on_hand} <span style={{ fontSize: '0.75rem', color: '#A1A1AA', fontWeight: 'normal' }}>{record.unit_of_measure}</span>
                        </td>

                        <td className="text-right" style={{ fontFamily: 'var(--font-mono)', color: '#52525B' }}>{record.available}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Stock;
