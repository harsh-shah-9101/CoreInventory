import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StockLedger = () => {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLedger = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/ledger');
      setLedger(res.data?.ledger || []);
    } catch { 
      setError('Failed to load stock ledger.'); 
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLedger(); }, []);

  const getMovementColor = (type, qty) => {
    if (type === 'RECEIPT' || type === 'TRANSFER_IN') return 'text-green-400';
    if (type === 'DELIVERY' || type === 'TRANSFER_OUT') return 'text-red-400';
    return qty > 0 ? 'text-green-400' : 'text-red-400'; // Adjustments
  };

  return (
    <div className="p-6 text-[#e2e2f0]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Stock Ledger</h1>
        <p className="text-[#a0a0b8] text-sm mt-1">Immutable audit log of all inventory movements</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}

      <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-[#2a2a3e]">
        <div className="px-5 py-4 border-b border-[#2a2a3e] flex items-center justify-between">
          <h2 className="font-semibold text-[#c0c0d8]">Movement History</h2>
          <span className="text-xs text-[#6b6b8a]">{ledger.length} records</span>
        </div>
        {loading ? (
          <div className="p-10 text-center flex flex-col items-center">
             <div className="w-8 h-8 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin mb-3" />
             <p className="text-[#a0a0b8] text-sm">Loading audit trail…</p>
          </div>
        ) : ledger.length === 0 ? (
          <div className="p-10 text-center"><p className="text-4xl mb-2">📖</p><p className="text-[#a0a0b8]">No stock movements recorded yet.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#16162a] text-[#a0a0b8] text-xs uppercase">
                <th className="px-5 py-4 text-left">Date</th>
                <th className="px-5 py-4 text-left">Product</th>
                <th className="px-5 py-4 text-left">Warehouse</th>
                <th className="px-5 py-4 text-left">Movement Type</th>
                <th className="px-5 py-4 text-right">Quantity Change</th>
                <th className="px-5 py-4 text-left">Source Document</th>
              </tr></thead>
              <tbody className="divide-y divide-[#2a2a3e]">
                {ledger.map((entry, i) => (
                  <tr key={entry.id || i} className="hover:bg-[#252538] transition-colors">
                    <td className="px-5 py-3 text-[#a0a0b8] whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-medium text-[#e2e2f0]">{entry.product_name}</td>
                    <td className="px-5 py-3 text-[#a0a0b8]">{entry.warehouse_name}</td>
                    <td className="px-5 py-3">
                       <span className="px-2 py-1 bg-[#2a2a3e] border border-[#3a3a55] text-[#c0c0d8] rounded text-xs font-mono">
                         {entry.movement_type}
                       </span>
                    </td>
                    <td className={`px-5 py-3 text-right font-semibold whitespace-nowrap ${getMovementColor(entry.movement_type, entry.quantity)}`}>
                      {entry.quantity > 0 ? `+${entry.quantity}` : entry.quantity}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-[#6b6b8a] uppercase">{entry.reference_type}</span>
                        <span className="font-mono text-[#a89eff] text-sm">{entry.reference_id}</span>
                      </div>
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

export default StockLedger;
