import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

const FilterBar = ({ filters, setFilters, warehouses = [], categories = [] }) => {
  const selStyle = {
    height: '33px',
    padding: '0 28px 0 10px',
    fontSize: '0.8rem',
    border: '1px solid #E4E4E7',
    borderRadius: '6px',
    background: '#FFF',
    color: '#09090B',
    minWidth: '150px',
    width: 'auto',
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    appearance: 'none',
    cursor: 'pointer',
    outline: 'none',
  };

  const labelStyle = {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '12px 16px',
      background: '#FAFAFA',
      border: '1px solid #E4E4E7',
      borderRadius: '8px',
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
        <SlidersHorizontal size={13} color="#71717A" strokeWidth={2} />
        <span style={labelStyle}>Filters</span>
      </div>

      {/* Type filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <label style={labelStyle}>Type</label>
        <select
          style={selStyle}
          value={filters.docType || ''}
          onChange={e => setFilters(f => ({ ...f, docType: e.target.value }))}
        >
          <option value="">All Types</option>
          <option value="Receipts">Receipts</option>
          <option value="Delivery">Deliveries</option>
          <option value="Transfer">Transfers</option>
          <option value="Adjustment">Adjustments</option>
        </select>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <label style={labelStyle}>Status</label>
        <select
          style={selStyle}
          value={filters.status || ''}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Waiting">Waiting</option>
          <option value="Ready">Ready</option>
          <option value="Done">Done</option>
          <option value="Canceled">Canceled</option>
        </select>
      </div>

      {/* Warehouse filter */}
      {warehouses.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <label style={labelStyle}>Warehouse</label>
          <select
            style={selStyle}
            value={filters.warehouseId || ''}
            onChange={e => setFilters(f => ({ ...f, warehouseId: e.target.value }))}
          >
            <option value="">All Warehouses</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
      )}

      {/* Category filter */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <label style={labelStyle}>Category</label>
          <select
            style={selStyle}
            value={filters.categoryId || ''}
            onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value }))}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {/* Clear */}
      {Object.values(filters).some(Boolean) && (
        <button
          onClick={() => setFilters({})}
          style={{
            height: '28px',
            padding: '0 10px',
            fontSize: '0.75rem',
            background: 'transparent',
            border: '1px solid #E4E4E7',
            borderRadius: '5px',
            color: '#71717A',
            cursor: 'pointer',
            marginTop: 'auto',
            alignSelf: 'flex-end',
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default FilterBar;
