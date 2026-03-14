import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StockByLocation = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true); setError('');
      try {
        const res = await api.get('/products/stock');
        setRows(res.data?.stock || res.data || []);
      } catch { setError('Failed to load stock data.'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const levelColor = (qty) => {
    if (qty === 0) return 'text-red-400 bg-red-900/30';
    if (qty <= 10) return 'text-yellow-400 bg-yellow-900/30';
    return 'text-green-400 bg-green-900/30';
  };

  return (
    <div className="p-6 text-[#e2e2f0]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Stock by Location</h1>
        <p className="text-[#a0a0b8] text-sm mt-1">View availability of products across all warehouse locations</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}

      <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-[#2a2a3e]">
        <div className="px-5 py-4 border-b border-[#2a2a3e] flex items-center justify-between">
          <h2 className="font-semibold text-[#c0c0d8]">Stock Availability</h2>
          <span className="text-xs text-[#6b6b8a]">{rows.length} records</span>
        </div>
        {loading ? (
          <div className="p-10 text-center"><div className="w-8 h-8 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-[#a0a0b8] text-sm">Loading…</p></div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center"><p className="text-4xl mb-2">📍</p><p className="text-[#a0a0b8]">No stock data available.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#16162a] text-[#a0a0b8] text-xs uppercase">
                <th className="px-5 py-4 text-left">Product</th>
                <th className="px-5 py-4 text-left">Warehouse</th>
                <th className="px-5 py-4 text-left">Location</th>
                <th className="px-5 py-4 text-right">On Hand</th>
                <th className="px-5 py-4 text-right">Reserved</th>
                <th className="px-5 py-4 text-right">Available</th>
              </tr></thead>
              <tbody className="divide-y divide-[#2a2a3e]">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-[#252538] transition-colors">
                    <td className="px-5 py-3 font-medium text-[#e2e2f0]">{r.product || r.product_name || '—'}</td>
                    <td className="px-5 py-3 text-[#a0a0b8]">{r.warehouse || '—'}</td>
                    <td className="px-5 py-3 text-[#a0a0b8]">{r.location || '—'}</td>
                    <td className="px-5 py-3 text-right text-[#e2e2f0]">{r.on_hand ?? r.qty ?? '—'}</td>
                    <td className="px-5 py-3 text-right text-[#a0a0b8]">{r.reserved ?? '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${levelColor(r.available ?? r.on_hand ?? 0)}`}>
                        {r.available ?? r.on_hand ?? '—'}
                      </span>
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

export default StockByLocation;
