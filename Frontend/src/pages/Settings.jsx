import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Settings = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add Warehouse Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWarehouse, setNewWarehouse] = [
    useState({ name: '', code: '', address: '' })
  ];
  const [formData, setFormData] = useState({ name: '', code: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchWarehouses = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data?.warehouses || res.data || []);
    } catch { setError('Failed to load warehouses.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/warehouses', formData);
      setShowAddForm(false);
      setFormData({ name: '', code: '', address: '' });
      fetchWarehouses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add warehouse');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "bg-transparent border-b border-[#a0a0b8] text-[#e2e2f0] px-2 py-1 focus:outline-none focus:border-[#ff8fab] transition-colors w-full";
  const labelClass = "text-[#ff8fab] font-script tracking-wide text-lg w-32 shrink-0"; // "font-script" simulates the handwritten style requested if custom font is added, otherwise just distinct color

  return (
    <div className="p-6 text-[#e2e2f0]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-[#a0a0b8] text-sm mt-1">Manage warehouses, locations, and system configuration</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}

      <div className="bg-[#1e1e2e] rounded-xl border border-[#2a2a3e] p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#ff8fab] mb-4 flex items-center gap-2 border-b border-[#3a3a55] pb-2 font-script tracking-wider">
          Warehouse
        </h2>
        
        {loading && warehouses.length === 0 ? (
          <div className="p-10 text-center"><div className="w-8 h-8 border-4 border-[#ff8fab] border-t-transparent rounded-full animate-spin mx-auto mb-3" /></div>
        ) : warehouses.length === 0 && !showAddForm ? (
          <p className="text-[#a0a0b8] text-sm">No warehouses configured.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {warehouses.map((w, i) => (
              <div key={w.id || i} className="p-4 bg-[#16162a] rounded-lg border border-[#2a2a3e] flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[#e2e2f0]">{w.name}</h3>
                  <p className="text-[#6b6b8a] text-xs">{w.code} • {w.address || 'No address'}</p>
                </div>
                <button className="text-[#ff8fab] hover:text-[#ffb3c6] text-xs font-medium">Edit</button>
              </div>
            ))}
          </div>
        )}

        {/* Add Warehouse Form matching Diagram Style */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="bg-[#16162a] p-6 rounded-lg border border-[#2a2a3e] mt-4 max-w-xl">
            <div className="flex flex-col gap-6">
              <div className="flex items-center">
                <label className={labelClass}>Name:</label>
                <div className="flex-1 max-w-[250px]"><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} /></div>
              </div>
              <div className="flex items-center">
                <label className={labelClass}>Short Code:</label>
                <div className="flex-1 max-w-[150px]"><input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className={inputClass} /></div>
              </div>
              <div className="flex items-center">
                <label className={labelClass}>Address:</label>
                <div className="flex-1 max-w-[350px]"><input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={inputClass} /></div>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button disabled={submitting} type="submit" className="px-5 py-2 bg-[#ff8fab] hover:bg-[#ffb3c6] text-[#13131f] rounded text-sm font-semibold transition-colors">
                {submitting ? 'Saving...' : 'Save Warehouse'}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2 border border-[#3a3a55] hover:bg-[#2a2a3e] text-[#a0a0b8] rounded text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} className="mt-4 px-4 py-2 border border-[#ff8fab] text-[#ff8fab] hover:bg-[#ff8fab]/10 rounded-lg text-sm font-medium transition-colors">
            ＋ Add Warehouse
          </button>
        )}
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
