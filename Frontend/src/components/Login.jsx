import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

const Login = () => {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await authService.login({ email, password });
      // Store user info with role in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      // Redirect based on role
      if (data.user?.role === 'warehouse_staff') {
        navigate('/warehouse');
      } else {
        navigate('/manager');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const inputClass = 'w-full bg-[#2a2a3e] border border-[#3a3a55] text-[#e2e2f0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#6c63ff] transition-colors';

  return (
    <div className="min-h-screen bg-[#13131f] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1e1e2e] rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
        <p className="text-[#a0a0b8] text-sm mb-6">Sign in to CoreInventory</p>

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className={inputClass} />

          <button type="submit" className="w-full bg-[#6c63ff] hover:bg-[#5a52e0] text-white font-semibold py-3 rounded-lg transition-colors mt-2">
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-[#6b6b8a] mt-5">
          Don't have an account? <Link to="/signup" className="text-[#6c63ff] hover:text-[#9b93ff]">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
