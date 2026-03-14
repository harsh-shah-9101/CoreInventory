import React, { useState, useEffect } from 'react';
import api from '../services/api';

const STATUSES = ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];

const MoveHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New State for Display & Filtering
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter history based on search term
  const filteredHistory = history.filter(h => {
    const term = searchTerm.toLowerCase();
    return (
      (h.reference && h.reference.toLowerCase().includes(term)) ||
      (h.contact && h.contact.toLowerCase().includes(term))
    );
  });

  // Group by status for Kanban
  const kanbanGroups = STATUSES.reduce((acc, status) => {
    acc[status] = filteredHistory.filter(h => h.status === status);
    return acc;
  }, {});

  const getTintClass = (type) => {
    if (type === 'Receipt') return 'text-green-400';
    if (type === 'Delivery') return 'text-red-400';
    return 'text-[#e2e2f0]';
  };

  return (
    <div className="p-6 text-[#e2e2f0]">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-4">
            Move History
          </h1>
          <p className="text-[#a0a0b8] text-sm mt-1">Chronological log of all stock movements and adjustments</p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b8a]">🔍</span>
            <input 
              type="text" 
              placeholder="Search reference or contact..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-[#1e1e2e] border border-[#3a3a55] text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#6c63ff]"
            />
          </div>
          <div className="flex bg-[#1e1e2e] border border-[#3a3a55] rounded-lg overflow-hidden">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-[#3a3a55] text-white' : 'text-[#a0a0b8] hover:text-white'}`}
            >
              ☰
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-2 text-sm border-l border-[#3a3a55] ${viewMode === 'kanban' ? 'bg-[#3a3a55] text-white' : 'text-[#a0a0b8] hover:text-white'}`}
            >
              ◫
            </button>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}

      <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-[#2a2a3e] min-h-[500px]">
        {loading ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-[#a0a0b8] text-sm">Loading…</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-10 text-center"><p className="text-4xl mb-2">📜</p><p className="text-[#a0a0b8]">No history found matching "{searchTerm}".</p></div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#16162a] text-[#a0a0b8] text-xs uppercase border-b border-[#2a2a3e]">
                <th className="px-5 py-3 text-left">Reference</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Contact</th>
                <th className="px-5 py-3 text-left">From</th>
                <th className="px-5 py-3 text-left">To</th>
                <th className="px-5 py-3 text-right">Quantity</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-[#2a2a3e]">
                {filteredHistory.map((h, i) => (
                  <tr key={h.id || i} className="hover:bg-[#252538] transition-colors border-l-2 border-transparent">
                    <td className={`px-5 py-4 font-mono font-medium ${getTintClass(h.type)}`}>{h.reference}</td>
                    <td className="px-5 py-4 text-[#6b6b8a] text-xs whitespace-nowrap">
                      {h.date ? new Date(h.date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4 text-[#e2e2f0]">{h.contact || '—'}</td>
                    <td className="px-5 py-4 text-[#a0a0b8]">{h.from_location || '—'}</td>
                    <td className="px-5 py-4 text-[#a0a0b8]">{h.to_location || '—'}</td>
                    <td className="px-5 py-4 text-right text-[#e2e2f0] font-semibold">{h.qty}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        h.status === 'Done' ? 'bg-green-500/20 text-green-300' :
                        h.status === 'Draft' ? 'bg-gray-500/20 text-gray-300' :
                        h.status === 'Canceled' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>{h.status || 'Done'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* KANBAN VIEW */
          <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto">
            {STATUSES.map(status => (
              <div key={status} className="bg-[#16162a] rounded-lg p-3 min-w-[250px] border border-[#2a2a3e]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-[#c0c0d8] text-sm uppercase">{status}</h3>
                  <span className="bg-[#2a2a3e] text-xs px-2 py-1 rounded-full">{kanbanGroups[status].length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {kanbanGroups[status].map((h, i) => (
                    <div key={i} className="bg-[#2a2a3e] p-3 rounded shadow-sm border border-[#3a3a55] hover:border-[#6c63ff] transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`font-mono text-xs font-semibold ${getTintClass(h.type)}`}>{h.reference}</span>
                        <span className="text-[10px] text-[#6b6b8a]">{h.date ? new Date(h.date).toLocaleDateString() : ''}</span>
                      </div>
                      <div className="text-sm text-[#e2e2f0]">{h.contact || 'No Contact'}</div>
                      <div className="text-xs text-[#a0a0b8] mt-2 flex justify-between">
                        <span>{h.product || 'N/A'}</span>
                        <span className="font-semibold">{h.qty} Units</span>
                      </div>
                    </div>
                  ))}
                  {kanbanGroups[status].length === 0 && (
                    <div className="text-center py-4 text-xs text-[#6b6b8a] italic">No items</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveHistory;
