import React, { useState } from 'react';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    // Simulate update
    setTimeout(() => {
      setSaving(false);
      setSuccess('Profile updated successfully!');
    }, 1000);
  };

  const inputClass = 'w-full bg-[#16162a] border border-[#2a2a3e] text-[#e2e2f0] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#6c63ff] transition-colors';

  return (
    <div className="p-6 text-[#e2e2f0] max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-[#a0a0b8] text-sm mt-1">Manage your account information and security</p>
      </div>

      {success && <div className="mb-6 p-3 bg-green-900/40 border border-green-700 text-green-300 rounded-lg text-sm">{success}</div>}

      <div className="bg-[#1e1e2e] rounded-xl border border-[#2a2a3e] overflow-hidden">
        <div className="p-6 border-b border-[#2a2a3e] flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#6c63ff]/30 flex items-center justify-center text-[#a89eff] font-bold text-2xl">
            {(form.name || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{form.name}</h2>
            <p className="text-[#a89eff] text-sm font-semibold uppercase tracking-wider">{user.role?.replace('_', ' ')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-[#6b6b8a] uppercase block mb-2">Display Name</label>
              <input className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6b6b8a] uppercase block mb-2">Email Address</label>
              <input className={inputClass} type="email" value={form.email} readOnly />
              <p className="text-[10px] text-[#6b6b8a] mt-1">Email cannot be changed</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#2a2a3e]">
            <h3 className="text-white font-semibold mb-4">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-[#6b6b8a] uppercase block mb-2">Current Password</label>
                <input className={inputClass} type="password" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6b6b8a] uppercase block mb-2">New Password</label>
                <input className={inputClass} type="password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#6c63ff] hover:bg-[#5a52e0] text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving changes…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
