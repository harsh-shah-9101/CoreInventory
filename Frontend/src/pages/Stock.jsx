import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Layers, Check, X } from 'lucide-react';

const Stock = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [editingId, setEditingId]   = useState(null);
  const [editValue, setEditValue]   = useState('');
  const [savingId, setSavingId]     = useState(null);

  const fetchProducts = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/products');
      setProducts(res.data?.products || res.data || []);
    } catch {
      setError('Failed to load stock data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleEditStart = (product) => {
    setEditingId(product.id);
    setEditValue(product.qty_on_hand ?? 0);
  };

  const handleEditSave = async (id) => {
    if (editingId === null) return;
    const numericValue = parseInt(editValue, 10) || 0;
    setEditingId(null);
    setSavingId(id);
    try {
      await api.put(`/products/${id}/stock`, { qty_on_hand: numericValue });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, qty_on_hand: numericValue } : p));
    } catch {
      setError('Failed to update stock.');
      fetchProducts();
    } finally {
      setSavingId(null);
    }
  };

  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter') handleEditSave(id);
    else if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: '100dvh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: '#FAFAFA' }}>

        <div className="page-header">
          <div>
            <h1 className="page-title">Stock</h1>
            <p className="page-subtitle">Current on-hand quantities — click a value to edit inline</p>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <div className="loading-state"><div className="spinner" /><p>Loading stock…</p></div>
        ) : (
          <div className="card">
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E4E4E7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#09090B' }}>All Products</h2>
              <span style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>{products.length} items</span>
            </div>
            {products.length === 0 ? (
              <div className="empty-state"><Layers size={32} strokeWidth={1} /><p>No stock data available.</p></div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th className="text-right">Per Unit Cost</th>
                      <th className="text-right">On Hand</th>
                      <th className="text-right">Free to Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const isEditing = editingId === p.id;
                      const isSaving  = savingId === p.id;
                      const qty = p.qty_on_hand ?? 0;

                      return (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 500 }}>{p.name}</td>
                          <td className="mono" style={{ color: '#7C3AED' }}>{p.sku || '—'}</td>
                          <td className="muted">{p.category || '—'}</td>
                          <td className="text-right muted">{p.price != null ? `$${(+p.price).toFixed(2)}` : '—'}</td>
                          <td className="text-right">
                            {isSaving ? (
                              <div className="spinner" style={{ width: 14, height: 14, marginLeft: 'auto' }} />
                            ) : isEditing ? (
                              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                <input
                                  autoFocus
                                  type="number"
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  onBlur={() => handleEditSave(p.id)}
                                  onKeyDown={e => handleKeyDown(e, p.id)}
                                  style={{ width: '64px', height: '28px', textAlign: 'center', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', padding: '0 6px' }}
                                />
                                <button onClick={() => handleEditSave(p.id)} style={{ background: '#F0FDF4', color: '#15803D', border: 'none', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}>
                                  <Check size={12} strokeWidth={2.5} />
                                </button>
                                <button onClick={() => setEditingId(null)} style={{ background: '#FEF2F2', color: '#B91C1C', border: 'none', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}>
                                  <X size={12} strokeWidth={2.5} />
                                </button>
                              </span>
                            ) : (
                              <span
                                onClick={() => handleEditStart(p)}
                                title="Click to update stock"
                                style={{
                                  cursor: 'pointer',
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  display: 'inline-block',
                                  transition: 'background 120ms',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#F4F4F5'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                {qty}
                              </span>
                            )}
                          </td>
                          <td className="text-right" style={{ fontFamily: 'var(--font-mono)', color: '#52525B' }}>{qty}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Stock;
