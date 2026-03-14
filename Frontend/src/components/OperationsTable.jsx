import React from 'react';
import { InboxIcon } from 'lucide-react';

const STATUS_STYLE = {
  Done:     { background: '#F0FDF4', color: '#15803D' },
  Ready:    { background: '#EFF6FF', color: '#1D4ED8' },
  Waiting:  { background: '#FFFBEB', color: '#B45309' },
  Draft:    { background: '#F4F4F5', color: '#52525B' },
  Canceled: { background: '#FEF2F2', color: '#B91C1C' },
};

const TYPE_STYLE = {
  Receipt:    { background: '#F5F3FF', color: '#6D28D9' },
  Delivery:   { background: '#FFF7ED', color: '#C2410C' },
  Transfer:   { background: '#EFF6FF', color: '#1D4ED8' },
  Adjustment: { background: '#F0FDF4', color: '#15803D' },
};

const Badge = ({ label, styleMap }) => {
  const s = styleMap[label] || { background: '#F4F4F5', color: '#52525B' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '0.72rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
      ...s,
    }}>{label}</span>
  );
};

const OperationsTable = ({ operations = [], loading }) => {
  if (loading) {
    return (
      <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div className="spinner" />
        <p style={{ fontSize: '0.85rem', color: '#A1A1AA' }}>Loading operations…</p>
      </div>
    );
  }

  if (operations.length === 0) {
    return (
      <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <InboxIcon size={32} color="#D4D4D8" strokeWidth={1} />
        <p style={{ fontSize: '0.875rem', color: '#A1A1AA' }}>No operations found</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Type</th>
            <th>Product</th>
            <th className="text-right">Qty</th>
            <th>Warehouse</th>
            <th>Status</th>
            <th>Scheduled</th>
          </tr>
        </thead>
        <tbody>
          {operations.map((op, idx) => (
            <tr key={`${op.type}-${op.id}-${idx}`}>
              <td className="mono" style={{ color: '#52525B' }}>{op.reference}</td>
              <td><Badge label={op.type} styleMap={TYPE_STYLE} /></td>
              <td style={{ fontWeight: 500 }}>{op.product}</td>
              <td className="text-right" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{op.qty}</td>
              <td className="muted">{op.warehouse}</td>
              <td><Badge label={op.status} styleMap={STATUS_STYLE} /></td>
              <td className="muted" style={{ fontSize: '0.8rem' }}>
                {op.scheduled_date ? new Date(op.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OperationsTable;
