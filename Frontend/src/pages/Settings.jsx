import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Warehouse, MapPin, Plus, X, Pencil, Palette, Globe } from 'lucide-react';

const Settings = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locError, setLocError] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: '100dvh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: '#FAFAFA' }}>
        
        <div className="page-header">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Manage warehouses, locations, and system configuration</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          
          {/* WAREHOUSE SECTION */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', background: '#F5F3FF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Warehouse size={20} color="#7C3AED" strokeWidth={1.5} />
                </div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Warehouses</h2>
              </div>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {showAddForm ? <X size={14} /> : <Plus size={14} />}
                {showAddForm ? 'Cancel' : 'Add'}
              </button>
            </div>
            
            {error && <div className="alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

            {showAddForm && (
              <form onSubmit={handleAddSubmit} style={{ background: '#FAFAFA', padding: '16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #E4E4E7' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="form-label">Warehouse Name</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Main Hub" />
                  </div>
                  <div>
                    <label className="form-label">Short Code</label>
                    <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="e.g. WH01" />
                  </div>
                  <div>
                    <label className="form-label">Address</label>
                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full address..." />
                  </div>
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <button disabled={submitting} type="submit" className="btn-primary btn-sm">
                    {submitting ? 'Saving...' : 'Save Warehouse'}
                  </button>
                </div>
              </form>
            )}

            {loading && warehouses.length === 0 ? (
              <div className="loading-state" style={{ minHeight: '100px' }}><div className="spinner" /></div>
            ) : warehouses.length === 0 ? (
              <div className="empty-state" style={{ minHeight: '150px' }}><Warehouse size={32} strokeWidth={1} /><p>No warehouses configured.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {warehouses.map((w, i) => (
                  <div key={w.id || i} style={{ padding: '14px', background: '#FAFAFA', borderRadius: '10px', border: '1px solid #F1F1F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#09090B' }}>{w.name}</h3>
                      <p style={{ fontSize: '0.75rem', color: '#71717A', marginTop: '2px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', color: '#7C3AED', fontWeight: 600 }}>{w.code}</span>
                        {w.address && <> • {w.address}</>}
                      </p>
                    </div>
                    <button style={{ color: '#71717A', background: 'none', border: 'none', cursor: 'pointer' }}><Pencil size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LOCATIONS SECTION */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', background: '#ECFDF5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={20} color="#059669" strokeWidth={1.5} />
                </div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Locations</h2>
              </div>
              <button 
                onClick={() => setShowAddLocForm(!showAddLocForm)}
                className="btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {showAddLocForm ? <X size={14} /> : <Plus size={14} />}
                {showAddLocForm ? 'Cancel' : 'Add'}
              </button>
            </div>
            
            {locError && <div className="alert-error" style={{ marginBottom: '16px' }}>{locError}</div>}

            {showAddLocForm && (
              <form onSubmit={handleAddLocSubmit} style={{ background: '#FAFAFA', padding: '16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #E4E4E7' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="form-label">Location Name</label>
                    <input type="text" required value={locFormData.name} onChange={e => setLocFormData({...locFormData, name: e.target.value})} placeholder="e.g. Shelf A-101" />
                  </div>
                  <div>
                    <label className="form-label">Short Code</label>
                    <input type="text" required value={locFormData.code} onChange={e => setLocFormData({...locFormData, code: e.target.value})} placeholder="e.g. SA101" />
                  </div>
                  <div>
                    <label className="form-label">Warehouse</label>
                    <select 
                      required
                      value={locFormData.warehouse_id} 
                      onChange={e => setLocFormData({...locFormData, warehouse_id: e.target.value})} 
                    >
                      <option value="" disabled>Select Warehouse</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <button disabled={submittingLoc} type="submit" className="btn-primary btn-sm">
                    {submittingLoc ? 'Saving...' : 'Save Location'}
                  </button>
                </div>
              </form>
            )}

            {loadingLocations && locations.length === 0 ? (
              <div className="loading-state" style={{ minHeight: '100px' }}><div className="spinner" /></div>
            ) : locations.length === 0 ? (
              <div className="empty-state" style={{ minHeight: '150px' }}><MapPin size={32} strokeWidth={1} /><p>No locations configured.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {locations.map((loc, i) => (
                  <div key={loc.id || i} style={{ padding: '14px', background: '#FAFAFA', borderRadius: '10px', border: '1px solid #F1F1F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#09090B' }}>{loc.name}</h3>
                      <p style={{ fontSize: '0.75rem', color: '#71717A', marginTop: '2px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', color: '#059669', fontWeight: 600 }}>{loc.code}</span>
                        <span style={{ margin: '0 6px', color: '#D4D4D8' }}>•</span>
                        {loc.warehouse_name || 'N/A'}
                      </p>
                    </div>
                    <button style={{ color: '#71717A', background: 'none', border: 'none', cursor: 'pointer' }}><Pencil size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* APPEARANCE SECTION */}
        <div className="card" style={{ padding: '24px', maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', background: '#F8FAFC', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Palette size={20} color="#64748B" strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Appearance</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#FAFAFA', borderRadius: '10px', border: '1px solid #F1F1F4' }}>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#09090B' }}>Premium White Theme</p>
                <p style={{ fontSize: '0.8rem', color: '#71717A', marginTop: '2px' }}>The system is currently using Arctic Professional theme.</p>
              </div>
              <div style={{ padding: '4px 12px', background: '#F0F9FF', color: '#0369A1', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>Active</div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#FAFAFA', borderRadius: '10px', border: '1px solid #F1F1F4' }}>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#09090B' }}>System Units</p>
                <p style={{ fontSize: '0.8rem', color: '#71717A', marginTop: '2px' }}>Default measurement units for inventory.</p>
              </div>
              <select style={{ width: 'auto', minWidth: '100px', height: '32px', fontSize: '0.85rem' }}>
                <option>Metric (kg, m)</option>
                <option>Imperial (lb, ft)</option>
              </select>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
