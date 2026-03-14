import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Settings = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Locations State
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locError, setLocError] = useState('');

  // Add Warehouse Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  // Add Location Form State
  const [showAddLocForm, setShowAddLocForm] = useState(false);
  const [locFormData, setLocFormData] = useState({ name: '', code: '', warehouse_id: '' });
  const [submittingLoc, setSubmittingLoc] = useState(false);

  const fetchWarehouses = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data?.warehouses || res.data || []);
    } catch { setError('Failed to load warehouses.'); }
    finally { setLoading(false); }
  };

  const fetchLocations = async () => {
    setLoadingLocations(true); setLocError('');
    try {
      const res = await api.get('/locations');
      setLocations(res.data?.locations || res.data || []);
    } catch { setLocError('Failed to load locations.'); }
    finally { setLoadingLocations(false); }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchLocations();
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

  const handleAddLocSubmit = async (e) => {
    e.preventDefault();
    if (!locFormData.warehouse_id) {
      setLocError('Please select a warehouse');
      return;
    }
    setSubmittingLoc(true);
    setLocError('');
    try {
      await api.post('/locations', locFormData);
      setShowAddLocForm(false);
      setLocFormData({ name: '', code: '', warehouse_id: '' });
      fetchLocations();
    } catch (err) {
      setLocError(err.response?.data?.error || 'Failed to add location');
    } finally {
      setSubmittingLoc(false);
    }
  };

  const inputClass = "bg-transparent border-b border-[#a0a0b8] text-[#e2e2f0] px-2 py-1 focus:outline-none focus:border-[#ff8fab] transition-colors w-full";
  const labelClass = "text-[#ff8fab] font-script tracking-wide text-lg w-32 shrink-0"; // "font-script" simulates the handwritten style requested if custom font is added

  // Same styling for Location to match Warehouse UI perfectly
  const inputClassLoc = "bg-transparent border-b border-[#a0a0b8] text-[#e2e2f0] px-2 py-1 focus:outline-none focus:border-[#4cc9f0] transition-colors w-full";
  const labelClassLoc = "text-[#4cc9f0] font-script tracking-wide text-lg w-32 shrink-0 capitalize";

  return (
    <div className="p-6 text-[#e2e2f0] max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-[#a0a0b8] text-sm mt-1">Manage warehouses, locations, and system configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* WAREHOUSE SECTION */}
        <div className="bg-[#1e1e2e] rounded-xl border border-[#2a2a3e] p-6 h-fit">
          <h2 className="text-lg font-semibold text-[#ff8fab] mb-4 flex items-center gap-2 border-b border-[#3a3a55] pb-2 font-script tracking-wider">
            Warehouse
          </h2>
          
          {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}

          {loading && warehouses.length === 0 ? (
            <div className="py-10 flex justify-center"><div className="w-6 h-6 border-4 border-[#ff8fab] border-t-transparent rounded-full animate-spin" /></div>
          ) : warehouses.length === 0 && !showAddForm ? (
            <p className="text-[#a0a0b8] text-sm py-4">No warehouses configured.</p>
          ) : (
            <div className="flex flex-col gap-3 mb-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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

          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="bg-[#16162a] p-5 rounded-lg border border-[#2a2a3e] mt-2 animate-fade-in">
              <div className="flex flex-col gap-5">
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
              <div className="mt-6 flex gap-3">
                <button disabled={submitting} type="submit" className="px-4 py-1.5 bg-[#ff8fab] hover:bg-[#ffb3c6] text-[#13131f] rounded text-sm font-semibold transition-colors">
                  {submitting ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-1.5 border border-[#3a3a55] hover:bg-[#2a2a3e] text-[#a0a0b8] rounded text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!showAddForm && (
            <button onClick={() => setShowAddForm(true)} className="mt-3 text-[#ff8fab] hover:text-[#ffb3c6] text-sm font-medium transition-colors">
              ＋ Add Warehouse
            </button>
          )}
        </div>

        {/* LOCATIONS SECTION */}
        <div className="bg-[#1e1e2e] rounded-xl border border-[#2a2a3e] p-6 h-fit">
          <h2 className="text-lg font-semibold text-[#4cc9f0] mb-4 flex items-center gap-2 border-b border-[#3a3a55] pb-2 font-script tracking-wider">
            Location
          </h2>
          
          {locError && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{locError}</div>}

          {loadingLocations && locations.length === 0 ? (
            <div className="py-10 flex justify-center"><div className="w-6 h-6 border-4 border-[#4cc9f0] border-t-transparent rounded-full animate-spin" /></div>
          ) : locations.length === 0 && !showAddLocForm ? (
            <p className="text-[#a0a0b8] text-sm py-4">No locations configured.</p>
          ) : (
            <div className="flex flex-col gap-3 mb-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {locations.map((loc, i) => (
                <div key={loc.id || i} className="p-4 bg-[#16162a] rounded-lg border border-[#2a2a3e] flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-[#e2e2f0]">{loc.name}</h3>
                    <p className="text-[#6b6b8a] text-xs">{loc.code} • In: {loc.warehouse_name || 'N/A'}</p>
                  </div>
                  <button className="text-[#4cc9f0] hover:text-[#72d4f2] text-xs font-medium">Edit</button>
                </div>
              ))}
            </div>
          )}

          {showAddLocForm && (
            <form onSubmit={handleAddLocSubmit} className="bg-[#16162a] p-5 rounded-lg border border-[#2a2a3e] mt-4 animate-fade-in relative overflow-hidden">
               {/* Decorative background dashed line referencing the diagram connecting lines */}
               <div className="absolute right-[-10px] top-[10px] w-[1px] h-[150px] border-l-2 border-dashed border-[#3a3a55] -rotate-[30deg] opacity-50 z-0 pointer-events-none"></div>

              <div className="flex flex-col gap-5 relative z-10">
                <div className="flex items-center">
                  <label className={labelClassLoc}>Name:</label>
                  <div className="flex-1 max-w-[250px]"><input type="text" required value={locFormData.name} onChange={e => setLocFormData({...locFormData, name: e.target.value})} className={inputClassLoc} /></div>
                </div>
                <div className="flex items-center">
                  <label className={labelClassLoc}>Short Code:</label>
                  <div className="flex-1 max-w-[150px]"><input type="text" required value={locFormData.code} onChange={e => setLocFormData({...locFormData, code: e.target.value})} className={inputClassLoc} /></div>
                </div>
                <div className="flex items-center">
                  <label className={labelClassLoc}>Warehouse:</label>
                  <div className="flex-1 max-w-[250px]">
                    <select 
                      required
                      value={locFormData.warehouse_id} 
                      onChange={e => setLocFormData({...locFormData, warehouse_id: e.target.value})} 
                      className="bg-[#1e1e2e] border-b border-[#a0a0b8] text-[#e2e2f0] px-2 py-1 focus:outline-none focus:border-[#4cc9f0] transition-colors w-full cursor-pointer"
                    >
                      <option value="" disabled>Select WH</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <p className="text-[#a0a0b8] text-xs italic text-center mt-2" style={{fontFamily: 'cursive'}}>
                  This holds the multiple locations of warehouse, rooms etc..
                </p>
              </div>

              <div className="mt-6 flex gap-3 relative z-10">
                <button disabled={submittingLoc} type="submit" className="px-4 py-1.5 bg-[#4cc9f0] hover:bg-[#72d4f2] text-[#13131f] rounded text-sm font-semibold transition-colors">
                  {submittingLoc ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowAddLocForm(false)} className="px-4 py-1.5 border border-[#3a3a55] hover:bg-[#2a2a3e] text-[#a0a0b8] rounded text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!showAddLocForm && (
            <button onClick={() => setShowAddLocForm(true)} className="mt-3 text-[#4cc9f0] hover:text-[#72d4f2] text-sm font-medium transition-colors">
              ＋ Add Location
            </button>
          )}
        </div>

      </div>

      {/* Theme Settings at bottom */}
      <div className="bg-[#1e1e2e] rounded-xl border border-[#2a2a3e] p-6 max-w-2xl">
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
