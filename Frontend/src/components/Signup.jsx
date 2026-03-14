import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { Package, AlertCircle, ArrowRight, Users, Warehouse } from 'lucide-react';

const Signup = () => {
  const [name, setName]               = useState('');
  const [loginId, setLoginId]         = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [reEnterPassword, setReEnterPassword] = useState('');
  const [role, setRole]               = useState('manager');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (loginId.length < 6 || loginId.length > 12) {
      return setError('Login ID must be between 6 and 12 characters.');
    }
    if (password.length <= 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return setError('Password must be > 8 characters with uppercase, lowercase, and a special character.');
    }
    if (password !== reEnterPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      await authService.signup({ name, login_id: loginId, email, password, role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      value: 'manager',
      icon: Users,
      label: 'Inventory Manager',
      desc: 'Manage stock, receipts & deliveries',
    },
    {
      value: 'warehouse_staff',
      icon: Warehouse,
      label: 'Warehouse Staff',
      desc: 'Transfers, picking & counting',
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: '#FFFFFF' }}>

      {/* Left panel */}
      <div style={{
        width: '40%',
        background: '#09090B',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        flexShrink: 0,
      }}>
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

        <div>
          <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '12px' }}>
            Join your team's workspace.
          </h1>
          <p style={{ color: '#52525B', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Create your account and start managing inventory with precision.
          </p>
        </div>

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
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#09090B', letterSpacing: '-0.025em', marginBottom: '6px' }}>
              Create account
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#71717A' }}>
              Fill in your details to get started
            </p>
          </div>

          {error && (
            <div className="alert-error" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="form-label">Full Name</label>
              <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
            </div>
            <div>
              <label className="form-label">Login ID <span style={{ color: '#A1A1AA', fontWeight: 400 }}>(6–12 chars)</span></label>
              <input type="text" placeholder="john_doe" value={loginId} onChange={e => setLoginId(e.target.value)} required minLength={6} maxLength={12} autoComplete="username" />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <div>
              <label className="form-label">Confirm Password</label>
              <input type="password" placeholder="Re-enter password" value={reEnterPassword} onChange={e => setReEnterPassword(e.target.value)} required autoComplete="new-password" />
            </div>

            {/* Role selector */}
            <div>
              <label className="form-label" style={{ marginBottom: '8px' }}>Your Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {roles.map(({ value, icon: Icon, label, desc }) => {
                  const active = role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${active ? '#09090B' : '#E4E4E7'}`,
                        background: active ? '#09090B' : '#FFFFFF',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                      }}
                    >
                      <Icon size={16} color={active ? '#FFFFFF' : '#52525B'} strokeWidth={1.5} style={{ marginBottom: '6px' }} />
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: active ? '#FFFFFF' : '#09090B', marginBottom: '2px' }}>{label}</p>
                      <p style={{ fontSize: '0.7rem', color: active ? '#A1A1AA' : '#71717A', lineHeight: 1.4 }}>{desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '4px', height: '42px', fontSize: '0.875rem', justifyContent: 'center' }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: '2px', borderTopColor: '#FFF' }} /> Creating account…</>
              ) : (
                <> Create Account <ArrowRight size={15} strokeWidth={2} /></>
              )}
            </button>
          </form>

          <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#A1A1AA', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#09090B', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
