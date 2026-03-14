import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Package, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/send-otp', { email });
      setSuccess('OTP sent to your email! (Check backend console for ethereal link)');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccess('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP or reset failed.');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 style={{ color: '#FFFFFF', fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '32px' }}>
            Regain access to your<br />warehouse.
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={15} color="#A1A1AA" strokeWidth={1.5} />
                </div>
                <span style={{ color: '#A1A1AA', fontSize: '0.875rem' }}>Secure OTP verification</span>
              </div>
          </div>
        </div>

        {/* Bottom */}
        <p style={{ color: '#3F3F46', fontSize: '0.75rem' }}>
          © 2026 CoreInventory
        </p>
      </div>

      {/* Right form */}
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
              Reset Password
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#71717A' }}>
              {step === 1 ? "Enter your email to receive a One-Time Password." : "Enter the OTP you received and your new password."}
            </p>
          </div>

          {error && (
            <div className="alert-error" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div style={{ background: '#ECFDF5', color: '#065F46', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '16px', display: 'flex', gap: '8px' }}>
                <ShieldCheck size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                {success}
            </div>
          )}

          {step === 1 ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px', height: '42px', justifyContent: 'center' }}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
          ) : (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">OTP Code</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                  <p style={{ marginTop: '6px', fontSize: '0.75rem', color: '#a1a1aa' }}>
                    Must be &gt;8 chars, 1 uppercase, 1 lowercase, 1 special character.
                  </p>
                </div>
                <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px', height: '42px', justifyContent: 'center' }}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
          )}

          <p style={{ marginTop: '24px', fontSize: '0.8rem', color: '#A1A1AA', textAlign: 'center' }}>
            Remembered your password?{' '}
            <Link to="/login" style={{ color: '#09090B', fontWeight: 600 }}>Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;