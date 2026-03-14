import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StockByLocation = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Inline Editing State
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [savingId, setSavingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true); setError('');
    try {
      // The screenshot implies a global product view rather than strict warehouse breakdowns.
      // So fetching the main products list gives us per-unit-cost and global on_hand easily.
      const res = await api.get('/products');
      setProducts(res.data?.products || res.data || []);
    } catch { 
      setError('Failed to load stock data.'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
      // Update local state instantly without full refetch for snappy UX
      setProducts(prev => prev.map(p => p.id === id ? { ...p, qty_on_hand: numericValue } : p));
    } catch (err) {
      setError('Failed to update stock.');
      fetchProducts(); // rollback on error
    } finally {
      setSavingId(null);
    }
  };

  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      handleEditSave(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <div className="p-8 text-[#e2e2f0] max-w-5xl mx-auto min-h-screen" style={{ backgroundColor: '#13131f' }}>
      
      {/* Header matching diagram */}
      <div className="flex justify-between items-end border-b border-[#ff8fab] pb-2 mb-6">
        <h1 className="text-4xl text-[#ff8fab]" style={{ fontFamily: 'cursive', letterSpacing: '1px' }}>
          Stock
        </h1>
        <div className="border border-[#ff8fab] rounded p-1">
          <span className="text-[#ff8fab] text-lg leading-none block transform translate-y-[-2px]">🔍</span>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>}

      {loading ? (
        <div className="py-10 flex justify-center"><div className="w-8 h-8 border-4 border-[#ff8fab] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="w-full">
          
          {/* Table Headers */}
          <div className="grid grid-cols-4 gap-4 text-[#e2e2f0] text-lg mb-3 px-2" style={{ fontFamily: 'cursive' }}>
            <div className="text-left font-medium">Product</div>
            <div className="text-center font-medium">per unit cost</div>
            <div className="text-center font-medium">On hand</div>
            <div className="text-center font-medium">free to Use</div>
          </div>

          <div className="border-t border-[#e2e2f0] mb-2"></div>

          {/* Table Body */}
          <div className="flex flex-col gap-0">
            {products.length === 0 ? (
              <div className="py-10 text-center text-[#a0a0b8] italic" style={{fontFamily: 'cursive'}}>No stock data available.</div>
            ) : (
              products.map((p) => {
                const isEditing = editingId === p.id;
                const isSaving = savingId === p.id;
                const priceStr = p.price != null ? `${(+p.price).toFixed(0)} Rs` : '0 Rs';
                const qtyOnHand = p.qty_on_hand ?? 0;
                // As per diagram, free to use might just be slightly less or same, simulating a -5 deduction for "reserved" 
                // but since we don't have reserved logic, we just render qty_on_hand or a mock reserved value. 
                // Let's just output exactly what is there (free to use = qty_on_hand unless we have actual reservations).
                // Looking at diagram: Desk has 50 on hand, 45 free to use. Table 50 on hand, 50 free to use.
                // We will render 'free to use' as qtyOnHand for now, or just mimic the visual if needed. I'll stick to real data (qtyOnHand).
                const freeToUse = qtyOnHand; 

                return (
                  <div key={p.id} className="grid grid-cols-4 gap-4 py-3 px-2 border-b border-dashed border-[#a0a0b8] items-center text-sm font-medium hover:bg-[#1e1e2e]/50 transition-colors">
                    
                    <div className="text-left text-[#e2e2f0] capitalize" style={{fontFamily: 'sans-serif', letterSpacing: '0.5px'}}>
                      {p.name}
                    </div>
                    
                    <div className="text-center text-[#e2e2f0]" style={{fontFamily: 'sans-serif'}}>
                      {priceStr}
                    </div>
                    
                    <div className="text-center flex justify-center items-center">
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-[#ff8fab] border-t-transparent rounded-full animate-spin"></div>
                      ) : isEditing ? (
                        <input
                          autoFocus
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleEditSave(p.id)}
                          onKeyDown={(e) => handleKeyDown(e, p.id)}
                          className="w-16 bg-[#2a2a3e] border border-[#ff8fab] text-center text-[#e2e2f0] rounded px-1 py-0.5 outline-none font-mono"
                        />
                      ) : (
                        <div 
                          className="cursor-pointer px-3 py-1 hover:bg-[#ff8fab]/20 rounded transition-colors text-[#e2e2f0]"
                          style={{fontFamily: 'sans-serif'}}
                          onClick={() => handleEditStart(p)}
                          title="Click to update stock"
                        >
                          {qtyOnHand}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-center text-[#e2e2f0]" style={{fontFamily: 'sans-serif'}}>
                      {freeToUse}
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default StockByLocation;
