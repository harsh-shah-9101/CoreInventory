import React from 'react';

const KPICard = ({ title, value, icon, color, subtitle }) => {
  return (
    <div
      className="bg-[#1e1e2e] rounded-xl p-5 flex flex-col gap-2 shadow-lg hover:-translate-y-1 transition-transform duration-200 cursor-default"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-13 h-13 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
        <div className="flex flex-col">
          <p className="text-xs text-[#a0a0b8] uppercase tracking-wide mb-1">{title}</p>
          <h2 className="text-3xl font-bold text-[#e2e2f0] leading-none">{value}</h2>
          {subtitle && <p className="text-xs text-[#6b6b8a] mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
