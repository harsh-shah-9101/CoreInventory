import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { Package, AlertCircle, ArrowRight, BarChart3, ShieldCheck, TrendingUp } from 'lucide-react';

const Login = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authService.login({ login_id: loginId, password });
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user?.role === 'warehouse_staff') {
        navigate('/warehouse');
      } else {
        navigate('/manager');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: BarChart3, text: 'Real-time inventory visibility' },
    { icon: ShieldCheck, text: 'Role-based access control' },
    { icon: TrendingUp, text: 'Operations & stock analytics' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: '#FFFFFF' }}>

      {/* Left panel */}
      <div style={{
        width: '45%',
        background: '#09090B',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Package size={18} color="#FFFFFF" strokeWidth={1.5} />
          </div>
          <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
            CoreInventory
          </span>
        </div>

        {/* Center content */}
        <div>
          <p style={{ color: '#71717A', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            Inventory Management System
          </p>
          <h1 style={{ color: '#FFFFFF', fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '32px' }}>
            Take control of every<br />unit in your warehouse.
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {features.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} color="#A1A1AA" strokeWidth={1.5} />
                </div>
                <span style={{ color: '#A1A1AA', fontSize: '0.875rem' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p style={{ color: '#3F3F46', fontSize: '0.75rem' }}>
          © 2026 CoreInventory · All rights reserved
        </p>
      </div>

      {/* Right — form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        background: '#FFFFFF',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#09090B', letterSpacing: '-0.025em', marginBottom: '6px' }}>
              Sign in
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#71717A' }}>
              Enter your credentials to access your workspace
            </p>
          </div>

          {error && (
            <div className="alert-error" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Login ID</label>
              <input
                type="text"
                placeholder="Enter your login ID"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '8px', height: '42px', fontSize: '0.875rem', justifyContent: 'center' }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: '2px', borderTopColor: '#FFF' }} /> Signing in…</>
              ) : (
                <> Sign In <ArrowRight size={15} strokeWidth={2} /></>
              )}
            </button>
          </form>

          <p style={{ marginTop: '24px', fontSize: '0.8rem', color: '#A1A1AA', textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#09090B', fontWeight: 600 }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
