import React from 'react';

const KPICard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorMap = {
    '#6c63ff': { bg: '#F5F3FF', text: '#7C3AED' },
    '#f59e0b': { bg: '#FFFBEB', text: '#B45309' },
    '#ef4444': { bg: '#FEF2F2', text: '#B91C1C' },
    '#10b981': { bg: '#F0FDF4', text: '#15803D' },
    '#3b82f6': { bg: '#EFF6FF', text: '#1D4ED8' },
    '#8b5cf6': { bg: '#F5F3FF', text: '#6D28D9' },
  };
  const resolved = colorMap[color] || { bg: '#F4F4F5', text: '#52525B' };
  const accentColor = resolved.text;

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E4E4E7',
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: '8px',
        padding: '18px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        cursor: 'default',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
      }}
    >
      {/* Icon + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {Icon && (
          <div style={{
            width: '28px', height: '28px',
            background: resolved.bg,
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={14} color={accentColor} strokeWidth={2} />
          </div>
        )}
        <p style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#71717A',
        }}>{title}</p>
      </div>

      {/* Value */}
      <p style={{
        fontSize: '1.75rem',
        fontWeight: 700,
        color: '#09090B',
        letterSpacing: '-0.025em',
        lineHeight: 1,
      }}>{value}</p>

      {/* Subtitle */}
      {subtitle && (
        <p style={{ fontSize: '0.72rem', color: '#A1A1AA', lineHeight: 1.4 }}>{subtitle}</p>
      )}
    </div>
  );
};

export default KPICard;
