import React, { useState } from 'react';
import api from '../services/api';

const COLORS = {
  Draft:    { bg: '#F4F4F5', text: '#52525B' },
  Waiting:  { bg: '#FFFBEB', text: '#B45309' },
  Ready:    { bg: '#EFF6FF', text: '#1D4ED8' },
  Done:     { bg: '#F0FDF4', text: '#15803D' },
  Canceled: { bg: '#FEF2F2', text: '#B91C1C' },
};

const StatusDropdown = ({ type, id, currentStatus, allowedStatuses, onUpdated }) => {
  const [status, setStatus]   = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setLoading(true);
    try {
      await api.patch(`/${type}/${id}/status`, { status: newStatus });
      setStatus(newStatus);
      onUpdated?.(id, newStatus);
    } catch {
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const c = COLORS[status] || { bg: '#F4F4F5', text: '#52525B' };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      style={{
        background: c.bg,
        color: c.text,
        border: 'none',
        borderRadius: '4px',
        padding: '3px 22px 3px 8px',
        fontSize: '0.72rem',
        fontWeight: 600,
        cursor: loading ? 'wait' : 'pointer',
        outline: 'none',
        height: '26px',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(c.text)}' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 6px center',
        minWidth: '90px',
      }}
    >
      {allowedStatuses.map(s => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
};

export default StatusDropdown;
