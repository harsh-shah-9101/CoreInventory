import React from 'react';

const DOC_TYPES = ['All', 'Receipts', 'Delivery', 'Internal', 'Adjustments'];
const STATUSES = ['All', 'Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];

const FilterBar = ({ filters, setFilters, warehouses, categories }) => {
  const handle = (key, val) =>
    setFilters(prev => ({ ...prev, [key]: val === 'All' ? '' : val }));

  const selectClass =
    'bg-[#2a2a3e] text-[#c0c0d8] border border-[#3a3a55] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] transition-colors cursor-pointer';

  return (
    <div className="flex flex-wrap gap-3 items-center p-4 bg-[#1e1e2e] rounded-xl shadow mb-6">
      <span className="text-[#a0a0b8] text-sm font-semibold uppercase tracking-wider mr-1">Filters:</span>

      {/* Doc Type */}
      <select
        className={selectClass}
        value={filters.docType || 'All'}
        onChange={e => handle('docType', e.target.value)}
      >
        {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
      </select>

      {/* Status */}
      <select
        className={selectClass}
        value={filters.status || 'All'}
        onChange={e => handle('status', e.target.value)}
      >
        {STATUSES.map(s => <option key={s}>{s}</option>)}
      </select>

      {/* Warehouse */}
      <select
        className={selectClass}
        value={filters.warehouseId || 'All'}
        onChange={e => handle('warehouseId', e.target.value)}
      >
        <option value="All">All Warehouses</option>
        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
      </select>

      {/* Category */}
      <select
        className={selectClass}
        value={filters.categoryId || 'All'}
        onChange={e => handle('categoryId', e.target.value)}
      >
        <option value="All">All Categories</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {/* Clear */}
      <button
        onClick={() => setFilters({})}
        className="ml-auto text-xs text-[#6c63ff] hover:text-[#9b93ff] border border-[#3a3a55] px-3 py-2 rounded-lg transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default FilterBar;
