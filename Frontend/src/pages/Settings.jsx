import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Settings = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWarehouses = async () => {
      setLoading(true); setError('');
      try {
        const res = await api.get('/warehouses');
        setWarehouses(res.data?.warehouses || res.data || []);
      } catch { setError('Failed to load warehouses.'); }
      finally { setLoading(false); }
    };
    fetchWarehouses();
  }, []);

  return (
    <div className="p-6 text-[#e2e2f0]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-[#a0a0b8] text-sm mt-1">Manage warehouses, locations, and system configuration</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}

      <div className="bg-[#1e1e2e] rounded-xl border border-[#2a2a3e] p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>🏭</span> Warehouses
        </h2>
        
        {loading ? (
          <div className="p-10 text-center"><div className="w-8 h-8 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" /></div>
        ) : warehouses.length === 0 ? (
          <p className="text-[#a0a0b8] text-sm">No warehouses configured.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouses.map((w, i) => (
              <div key={w.id || i} className="p-4 bg-[#16162a] rounded-lg border border-[#2a2a3e] flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[#e2e2f0]">{w.name}</h3>
                  <p className="text-[#6b6b8a] text-xs">{w.code} • {w.address || 'No address'}</p>
                </div>
                <button className="text-[#6c63ff] hover:text-[#a89eff] text-xs font-medium">Edit</button>
              </div>
            ))}
          </div>
        )}
        <button className="mt-4 px-4 py-2 border border-[#6c63ff] text-[#6c63ff] hover:bg-[#6c63ff]/10 rounded-lg text-sm font-medium transition-colors">
          ＋ Add Warehouse
        </button>
      </div>

      <div className="bg-[#1e1e2e] rounded-xl border border-[#2a2a3e] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Appearance & Theme</h2>
        <div className="flex items-center justify-between p-4 bg-[#16162a] rounded-lg border border-[#2a2a3e]">
          <div>
            <p className="text-[#e2e2f0] text-sm font-medium">Dark Mode</p>
            <p className="text-[#6b6b8a] text-xs">Always enabled for eye comfort</p>
          </div>
          <div className="w-10 h-5 bg-[#6c63ff] rounded-full relative">
            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
