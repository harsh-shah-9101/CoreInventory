import React, { useState } from 'react';
import api from '../services/api';

const ALL_STATUSES = ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];

const STATUS_COLORS = {
  Draft:     'bg-gray-700 text-gray-200',
  Waiting:   'bg-yellow-800 text-yellow-200',
  Ready:     'bg-blue-800 text-blue-200',
  Done:      'bg-green-800 text-green-200',
  Canceled:  'bg-red-800 text-red-200',
};

const StatusDropdown = ({ type, id, currentStatus, allowedStatuses, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const options = allowedStatuses || ALL_STATUSES;

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;
    setLoading(true);
    setError('');
    try {
      await api.patch(`/operations/${type}/${id}/status`, { status: newStatus });
      onUpdated(id, newStatus);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={loading}
        className={`text-xs font-semibold px-2 py-1 rounded-md border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#6c63ff] ${STATUS_COLORS[currentStatus] || 'bg-gray-700 text-gray-200'} ${loading ? 'opacity-50 cursor-wait' : ''}`}
      >
        {options.map(s => (
          <option key={s} value={s} className="bg-[#2a2a3e] text-[#e2e2f0]">{s}</option>
        ))}
      </select>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
};

export default StatusDropdown;
