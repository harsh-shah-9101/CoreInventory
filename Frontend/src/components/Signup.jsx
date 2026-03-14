import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

const Signup = () => {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]       = useState('manager');
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await authService.signup({ name, email, password, role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  const inputClass = 'w-full bg-[#2a2a3e] border border-[#3a3a55] text-[#e2e2f0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#6c63ff] transition-colors';

  return (
    <div className="min-h-screen bg-[#13131f] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1e1e2e] rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
        <p className="text-[#a0a0b8] text-sm mb-6">Join CoreInventory</p>

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className={inputClass} />
          <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className={inputClass} />

          {/* Role Selector */}
          <div>
            <label className="text-xs text-[#a0a0b8] uppercase tracking-wider mb-2 block">Your Role</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'manager',        label: '📋 Inventory Manager',   desc: 'Manage stock, receipts & deliveries' },
                { value: 'warehouse_staff', label: '🏭 Warehouse Staff',     desc: 'Transfers, picking & counting' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${role === opt.value ? 'border-[#6c63ff] bg-[#6c63ff]/10' : 'border-[#3a3a55] bg-[#2a2a3e] hover:border-[#6c63ff]/50'}`}
                >
                  <p className="text-sm font-semibold text-[#e2e2f0]">{opt.label}</p>
                  <p className="text-xs text-[#6b6b8a] mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-[#6c63ff] hover:bg-[#5a52e0] text-white font-semibold py-3 rounded-lg transition-colors mt-2">
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-[#6b6b8a] mt-5">
          Already have an account? <Link to="/login" className="text-[#6c63ff] hover:text-[#9b93ff]">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
