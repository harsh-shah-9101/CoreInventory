import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MoveHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true); setError('');
      try {
        const res = await api.get('/operations/history');
        setHistory(res.data?.history || res.data || []);
      } catch { setError('Failed to load move history.'); }
      finally { setLoading(false); }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-6 text-[#e2e2f0]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Move History</h1>
        <p className="text-[#a0a0b8] text-sm mt-1">Chronological log of all stock movements and adjustments</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}

      <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-[#2a2a3e]">
        <div className="px-5 py-4 border-b border-[#2a2a3e] flex items-center justify-between">
          <h2 className="font-semibold text-[#c0c0d8]">Audit Log</h2>
          <span className="text-xs text-[#6b6b8a]">{history.length} operations</span>
        </div>
        {loading ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-[#a0a0b8] text-sm">Loading…</p>
          </div>
        ) : history.length === 0 ? (
          <div className="p-10 text-center"><p className="text-4xl mb-2">📜</p><p className="text-[#a0a0b8]">No history found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#16162a] text-[#a0a0b8] text-xs uppercase">
                <th className="px-5 py-4 text-left">Date</th>
                <th className="px-5 py-4 text-left">Reference</th>
                <th className="px-5 py-4 text-left">Product</th>
                <th className="px-5 py-4 text-left">From</th>
                <th className="px-5 py-4 text-left">To</th>
                <th className="px-5 py-4 text-right">Qty</th>
                <th className="px-5 py-4 text-left">User</th>
              </tr></thead>
              <tbody className="divide-y divide-[#2a2a3e]">
                {history.map((h, i) => (
                  <tr key={h.id || i} className="hover:bg-[#252538] transition-colors">
                    <td className="px-5 py-4 text-[#6b6b8a] text-xs">
                      {h.date ? new Date(h.date).toLocaleString() : '—'}
                    </td>
                    <td className="px-5 py-4 font-mono font-medium text-[#c0c0d8]">{h.reference}</td>
                    <td className="px-5 py-4 text-[#e2e2f0]">{h.product}</td>
                    <td className="px-5 py-4 text-[#a0a0b8]">{h.from_location || '—'}</td>
                    <td className="px-5 py-4 text-[#a0a0b8]">{h.to_location || '—'}</td>
                    <td className="px-5 py-4 text-right text-[#e2e2f0] font-semibold">{h.qty}</td>
                    <td className="px-5 py-4 text-[#a0a0b8] text-xs">{h.user_name || 'System'}</td>
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

export default MoveHistory;
