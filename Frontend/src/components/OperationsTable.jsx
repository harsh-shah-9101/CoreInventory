import React from 'react';

const STATUS_COLORS = {
  Draft:     'bg-gray-700 text-gray-300',
  Waiting:   'bg-yellow-900/60 text-yellow-300',
  Ready:     'bg-blue-900/60 text-blue-300',
  Done:      'bg-green-900/60 text-green-300',
  Canceled:  'bg-red-900/60 text-red-300',
};

const TYPE_COLORS = {
  Receipt:    'bg-purple-900/50 text-purple-300',
  Delivery:   'bg-orange-900/50 text-orange-300',
  Transfer:   'bg-cyan-900/50 text-cyan-300',
  Adjustment: 'bg-pink-900/50 text-pink-300',
};

const OperationsTable = ({ operations, loading }) => {
  if (loading) {
    return (
      <div className="bg-[#1e1e2e] rounded-xl shadow p-10 text-center">
        <div className="w-8 h-8 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-[#a0a0b8] text-sm">Loading operations...</p>
      </div>
    );
  }

  if (!operations || operations.length === 0) {
    return (
      <div className="bg-[#1e1e2e] rounded-xl shadow p-10 text-center">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-[#a0a0b8]">No operations found for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1e1e2e] rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#16162a] text-[#a0a0b8] text-xs uppercase tracking-wider">
              <th className="px-5 py-4 text-left">Reference</th>
              <th className="px-5 py-4 text-left">Type</th>
              <th className="px-5 py-4 text-left">Product</th>
              <th className="px-5 py-4 text-right">Qty</th>
              <th className="px-5 py-4 text-left">Warehouse</th>
              <th className="px-5 py-4 text-left">Status</th>
              <th className="px-5 py-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a3e]">
            {operations.map((op, idx) => (
              <tr
                key={`${op.type}-${op.id}-${idx}`}
                className="hover:bg-[#252538] transition-colors"
              >
                <td className="px-5 py-3 font-mono text-[#c0c0d8] font-medium">{op.reference}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${TYPE_COLORS[op.type] || 'bg-gray-700 text-gray-300'}`}>
                    {op.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-[#e2e2f0]">{op.product}</td>
                <td className="px-5 py-3 text-right text-[#e2e2f0] font-semibold">
                  {op.qty > 0 ? `+${op.qty}` : op.qty}
                </td>
                <td className="px-5 py-3 text-[#a0a0b8]">{op.warehouse}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${STATUS_COLORS[op.status] || 'bg-gray-700 text-gray-300'}`}>
                    {op.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-[#6b6b8a] text-xs">
                  {op.scheduled_date ? new Date(op.scheduled_date).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OperationsTable;
