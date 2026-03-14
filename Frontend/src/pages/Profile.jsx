import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { User, Mail, Shield, Key, Camera, Check } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    // In a real app, this would fetch the current user profile
    const fetchProfile = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePassUpdate = (e) => {
    e.preventDefault();
    setUpdating(true);
    setMsg({ type: '', text: '' });
    
    // Simulate API call
    setTimeout(() => {
      if (passData.new !== passData.confirm) {
        setMsg({ type: 'error', text: 'New passwords do not match' });
      } else {
        setMsg({ type: 'success', text: 'Password successfully updated' });
        setPassData({ current: '', new: '', confirm: '' });
      }
      setUpdating(false);
    }, 1000);
  };

  if (loading) return (
    <div style={{ display: 'flex', flex: 1, minHeight: '100dvh' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
        <div className="spinner" />
      </main>
    </div>
  );

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: '100dvh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: '#FAFAFA' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Personal Profile</h1>
            <p className="page-subtitle">Manage your account information and security</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          
          {/* USER INFO CARD */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ height: '120px', background: 'linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: '-40px', left: '24px', width: '80px', height: '80px', borderRadius: '50%', background: 'white', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <User size={40} color="#7C3AED" />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                  <Camera size={20} color="white" />
                </div>
              </div>
            </div>
            
            <div style={{ padding: '60px 24px 24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#09090B' }}>{user?.fullName || 'User Name'}</h2>
              <p style={{ fontSize: '0.9rem', color: '#71717A' }}>@{user?.username || 'username'}</p>
              
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Mail size={16} color="#A1A1AA" />
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#A1A1AA', fontWeight: 500, textTransform: 'uppercase' }}>Email Address</p>
                    <p style={{ fontSize: '0.9rem', color: '#09090B' }}>{user?.email || 'email@example.com'}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Shield size={16} color="#A1A1AA" />
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#A1A1AA', fontWeight: 500, textTransform: 'uppercase' }}>Account Role</p>
                    <div style={{ marginTop: '4px', display: 'inline-flex', padding: '2px 10px', background: '#F5F3FF', color: '#7C3AED', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {user?.role || 'Admin'}
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="btn-secondary" style={{ width: '100%', marginTop: '32px' }}>Edit Profile</button>
            </div>
          </div>

          {/* PASSWORD CARD */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ width: '36px', height: '36px', background: '#FEF2F2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={20} color="#DC2626" strokeWidth={1.5} />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Security Settings</h2>
            </div>
            
            <form onSubmit={handlePassUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Current Password</label>
                <input type="password" required value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} placeholder="••••••••" />
              </div>
              
              <div style={{ height: '1px', background: '#F1F1F4', margin: '4px 0' }} />
              
              <div>
                <label className="form-label">New Password</label>
                <input type="password" required value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} placeholder="••••••••" />
              </div>
              
              <div>
                <label className="form-label">Confirm New Password</label>
                <input type="password" required value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} placeholder="••••••••" />
              </div>
              
              {msg.text && (
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  fontSize: '0.85rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: msg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                  color: msg.type === 'success' ? '#15803D' : '#B91C1C',
                  border: msg.type === 'success' ? '1px solid #BBF7D0' : '1px solid #FECACA'
                }}>
                  {msg.type === 'success' ? <Check size={16} /> : <X size={16} />}
                  {msg.text}
                </div>
              )}
              
              <button disabled={updating} type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                {updating ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Profile;
