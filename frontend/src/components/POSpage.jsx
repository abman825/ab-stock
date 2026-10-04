import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Base URL setup with correct variable name
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

function POS({ cart = [], setCart, onCompleteSale, loading }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  // Low stock filter toggle
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Today's Sales State
  const [todaySales, setTodaySales] = useState({ cash: 0, bank: 0, telebirr: 0, total: 0 });
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);

  // Cart Form State
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState('percent'); // 'percent' or 'fixed'
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Business Mode Check
  const rawType = localStorage.getItem('businessType') || 'pharmacy';
  const isBuildingMode = rawType.toLowerCase().includes('building');

  // Default Today's Date (YYYY-MM-DD)
  const todayDateString = new Date().toISOString().split('T')[0];

  // Helper Function for Axios Headers with Token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    };
  };

  // Fetch Data from Backend API
  const fetchData = async () => {
    try {
      const config = getAuthHeaders();

      let currentBusinessType = isBuildingMode ? 'building' : 'pharmacy';

      const [prodRes, catRes, salesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products?businessType=${currentBusinessType}`, config),
        axios.get(`${API_BASE_URL}/categories?businessType=${currentBusinessType}`, config),
        axios.get(`${API_BASE_URL}/orders/today-summary?businessType=${currentBusinessType}`, config)
          .catch(() => ({ data: { cash: 0, bank: 0, telebirr: 0, total: 0 } }))
      ]);

      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
      if (salesRes.data) setTodaySales(salesRes.data);
    } catch (err) {
      console.error('Error fetching POS data:', err);
    }
  };

  useEffect(() => {
    fetchData();

    const handleModeChange = () => fetchData();
    window.addEventListener('storage', handleModeChange);
    window.addEventListener('businessTypeChanged', handleModeChange);

    return () => {
      window.removeEventListener('storage', handleModeChange);
      window.removeEventListener('businessTypeChanged', handleModeChange);
    };
  }, []);

  // Add Item to Cart
  const addToCart = (product) => {
    const stockQty = product.quantity ?? product.inShop ?? product.stock ?? 0;
    if (stockQty <= 0) {
      alert('Out of Stock!');
      return;
    }

    const productId = product._id || product.id;
    const existingIndex = cart.findIndex((item) => (item._id || item.id) === productId);

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      if (updatedCart[existingIndex].cartQty + 1 > stockQty) {
        alert('Stock limit exceeded!');
        return;
      }
      updatedCart[existingIndex].cartQty += 1;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          ...product,
          productId: productId,
          cartQty: 1,
          customPrice: product.price,
          soldAtDate: todayDateString,
          expiryDate: product.expiryDate || product.expirationDate || ''
        }
      ]);
    }
  };

  // Update Cart Quantity
  const updateQty = (id, delta) => {
    setCart(
      cart
        .map((item) => {
          const itemId = item._id || item.id;
          if (itemId === id) {
            const newQty = item.cartQty + delta;
            const stockQty = item.quantity ?? item.inShop ?? item.stock ?? 999;
            if (newQty > stockQty) {
              alert('Stock limit exceeded!');
              return item;
            }
            return newQty > 0 ? { ...item, cartQty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Update Sold at Date
  const updateSoldAtDate = (id, dateValue) => {
    setCart(
      cart.map((item) =>
        (item._id || item.id) === id ? { ...item, soldAtDate: dateValue } : item
      )
    );
  };

  // Remove Item from Cart
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => (item._id || item.id) !== id));
  };

  // Cart Calculations
  const subtotalRaw = cart.reduce(
    (sum, item) => sum + (Number(item.customPrice || item.price || 0) * item.cartQty),
    0
  );

  const subtotal = Number(subtotalRaw.toFixed(2));

  let calculatedDiscountBirr = 0;
  if (discountType === 'percent') {
    calculatedDiscountBirr = (subtotal * Number(discountValue || 0)) / 100;
  } else {
    calculatedDiscountBirr = Number(discountValue || 0);
  }

  const discountBirr = Number(Math.min(calculatedDiscountBirr, subtotal).toFixed(2));
  const grandTotal = Number(Math.max(0, subtotal - discountBirr).toFixed(2));

  // Checkout Handler
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    try {
      let currentBusinessType = isBuildingMode ? 'building' : 'pharmacy';

      const orderPayload = {
        items: cart.map(item => ({
          ...item,
          product: item.productId || item._id,
          price: Number(Number(item.customPrice || item.price || 0).toFixed(2)),
          quantity: item.cartQty
        })),
        subtotal: subtotal,
        discountType: discountType,
        discountValue: Number(discountValue || 0),
        discountAmount: discountBirr,
        grandTotal: grandTotal,
        paymentMethod: paymentMethod,
        businessType: currentBusinessType,
        soldAtDate: todayDateString
      };

      if (onCompleteSale) {
        await onCompleteSale(orderPayload);
      } else {
        await axios.post(`${API_BASE_URL}/orders`, orderPayload, getAuthHeaders());
        alert('Sale completed successfully!');
        setCart([]);
      }

      fetchData();
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Checkout failed! Please check server connection.');
    }
  };

  // Helper function for Low Stock check
  const isProductLowStock = (p) => {
    const qty = p.quantity ?? p.inShop ?? p.stock ?? 0;
    const threshold = Number(p.stockThreshold);
    if (!isNaN(threshold) && threshold > 0) {
      return qty < threshold;
    }
    return qty < 5;
  };

  // Filter Products (By Search, Category, Low Stock, AND Business Mode)
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      ? p.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesCategory =
      selectedCategory === 'All Categories' || p.category === selectedCategory;
    const matchesLowStock = showLowStockOnly ? isProductLowStock(p) : true;

    // Fixed Business Mode Filter check
    const prodType = (p.businessType || p.businessMode || '').toLowerCase();
    let matchesMode = true;
    if (isBuildingMode) {
      matchesMode = prodType.includes('building') || Boolean(p.materialType) || Boolean(p.unit) || (!p.specificType && !p.expiryDate);
    } else {
      matchesMode = prodType.includes('pharmacy') || Boolean(p.specificType) || Boolean(p.expiryDate);
    }

    return matchesSearch && matchesCategory && matchesLowStock && matchesMode;
  });

  const lowStockCount = products.filter(p => {
    const prodType = (p.businessType || p.businessMode || '').toLowerCase();
    const matchesMode = isBuildingMode 
      ? (prodType.includes('building') || Boolean(p.materialType) || Boolean(p.unit) || (!p.specificType && !p.expiryDate))
      : (prodType.includes('pharmacy') || Boolean(p.specificType) || Boolean(p.expiryDate));
    return matchesMode && isProductLowStock(p);
  }).length;

  return (
    <div style={{ padding: '20px', flex: 1, background: '#f4f6f8', fontFamily: 'sans-serif' }}>
      
      {/* Top Header Section */}
      <div 
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '12px', 
          marginBottom: '20px', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}
      >
        
        {/* Search & Categories Box */}
        <div 
          className="search-cat-container"
          style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            gap: '10px', 
            background: '#fff', 
            padding: '6px 12px', 
            borderRadius: '6px', 
            border: '1px solid #ced4da', 
            flex: '1 1 300px', 
            minWidth: '220px', 
            alignItems: 'center' 
          }}
        >
          <input
            type="text"
            placeholder="Search product name or category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (showLowStockOnly) setShowLowStockOnly(false);
            }}
            style={{ 
              border: 'none', 
              outline: 'none', 
              width: '100%', 
              fontSize: '13px', 
              padding: '4px 0' 
            }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              if (showLowStockOnly) setShowLowStockOnly(false);
            }}
            style={{ 
              borderLeft: '1px solid #e0e0e0', 
              borderTop: 'none', 
              borderRight: 'none', 
              borderBottom: 'none', 
              outline: 'none', 
              fontSize: '13px', 
              background: 'transparent', 
              color: '#495057', 
              cursor: 'pointer', 
              paddingLeft: '8px', 
              maxWidth: '140px',
              textOverflow: 'ellipsis' 
            }}
          >
            <option value="All Categories">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id || cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Small Cards Container */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Today's Sales Card */}
          <div
            onClick={() => setIsSalesModalOpen(true)}
            style={{ 
              background: '#fff', 
              padding: '8px 12px', 
              borderRadius: '6px', 
              border: '1px solid #e0e0e0', 
              cursor: 'pointer', 
              minWidth: '130px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Today's Sales</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#212529' }}>
                {Number(todaySales.total || 0).toFixed(2)} Birr
              </div>
            </div>
            <span style={{ background: '#e8f5e9', color: '#28a745', padding: '4px 8px', borderRadius: '6px', fontSize: '14px' }}>🛒</span>
          </div>

          {/* Low Stock Items Card */}
          <div 
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            style={{ 
              background: showLowStockOnly ? '#ffebee' : '#fff', 
              padding: '8px 12px', 
              borderRadius: '6px', 
              border: showLowStockOnly ? '2px solid #dc3545' : '1px solid #e0e0e0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              cursor: 'pointer', 
              minWidth: '130px',
              gap: '10px'
            }}
            title="Click to toggle low stock products"
          >
            <div>
              <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                Low Stock {showLowStockOnly && '(Filtered)'}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#dc3545' }}>
                {lowStockCount}
              </div>
            </div>
            <span style={{ background: '#ffebee', color: '#dc3545', padding: '4px 8px', borderRadius: '6px', fontSize: '14px' }}>⚠️</span>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 600px) {
          .search-cat-container {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .search-cat-container select {
            border-left: none !important;
            border-top: 1px solid #e0e0e0 !important;
            padding-left: 0 !important;
            padding-top: 6px !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Main Grid: Left Products - Right Cart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px', height: 'calc(100vh - 160px)' }}>
        
        {/* Left Side: Products Grid */}
        <div style={{ overflowY: 'auto', paddingRight: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
              {showLowStockOnly ? 'Low Stock Products' : 'Products'}
            </h3>
            {showLowStockOnly && (
              <button 
                onClick={() => setShowLowStockOnly(false)}
                style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
              >
                Clear Filter
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
            {filteredProducts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: '#6c757d' }}>
                No products found.
              </div>
            ) : (
              filteredProducts.map((product) => {
                const productId = product._id || product.id;
                const isAdded = cart.some((item) => (item._id || item.id) === productId);
                const qty = product.quantity ?? product.inShop ?? product.stock ?? 0;
                
                const isLowStock = isProductLowStock(product);
                const expDate = product.expiryDate || product.expirationDate;

                return (
                  <div 
                    key={productId} 
                    style={{ 
                      background: '#fff', 
                      borderRadius: '8px', 
                      padding: '12px', 
                      border: isLowStock ? '2px solid #dc3545' : '1px solid #e0e0e0', 
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    {isLowStock && (
                      <span 
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: '#dc3545',
                          color: '#fff',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        Low Stock
                      </span>
                    )}

                    <div style={{ height: '70px', background: '#f8f9fa', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '32px' }}>📦</span>
                    </div>

                    <div style={{ background: '#e8f5e9', color: '#28a745', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginBottom: '6px' }}>
                      {Number(product.price || 0).toFixed(2)} Birr
                    </div>

                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#333' }}>{product.name}</div>
                    
                    <div style={{ fontSize: '10px', color: isLowStock ? '#dc3545' : '#6c757d', fontWeight: isLowStock ? 'bold' : 'normal', marginBottom: '2px' }}>
                      Qty: {qty} {isBuildingMode && product.unit ? `(${product.unit})` : ''} {isLowStock && '⚠️'}
                    </div>

                    {/* Pharmacy Mode: Exp Date */}
                    {!isBuildingMode && (
                      <div style={{ fontSize: '10px', color: expDate ? '#fd7e14' : '#adb5bd', fontWeight: '500', marginBottom: '8px' }}>
                        Exp: {expDate ? new Date(expDate).toLocaleDateString() : 'N/A'}
                      </div>
                    )}

                    {/* Building Mode: Unit & Material Type */}
                    {isBuildingMode && (
                      <div style={{ fontSize: '10px', color: '#0d6efd', fontWeight: '500', marginBottom: '8px' }}>
                        Unit: {product.unit || product.materialType || 'N/A'}
                      </div>
                    )}

                    <button
                      onClick={() => addToCart(product)}
                      style={{
                        width: '100%',
                        background: isAdded ? '#17a2b8' : isLowStock ? '#dc3545' : '#0d6efd',
                        color: '#fff',
                        border: 'none',
                        padding: '6px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    >
                      {isAdded ? 'Added' : 'Add to Cart'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Cart Panel */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '15px', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#495057', textAlign: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>Current Cart</h4>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#adb5bd', padding: '40px 0' }}>Cart is empty</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                {cart.map((item) => {
                  const itemId = item._id || item.id;
                  const itemExpDate = item.expiryDate || item.expirationDate;
                  const itemUnitPrice = Number(item.customPrice || item.price || 0);
                  const itemTotal = itemUnitPrice * item.cartQty;

                  return (
                    <div key={itemId} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{item.name}</div>
                          <div style={{ fontSize: '10px', color: '#6c757d' }}>{itemUnitPrice.toFixed(2)} Birr</div>
                        </div>
                        <button onClick={() => removeFromCart(itemId)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>✖</button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <button onClick={() => updateQty(itemId, -1)} style={{ border: '1px solid #ccc', background: '#fff', width: '22px', height: '22px', borderRadius: '3px', cursor: 'pointer' }}>-</button>
                          <span style={{ fontSize: '12px', padding: '0 5px' }}>{item.cartQty}</span>
                          <button onClick={() => updateQty(itemId, 1)} style={{ border: '1px solid #ccc', background: '#fff', width: '22px', height: '22px', borderRadius: '3px', cursor: 'pointer' }}>+</button>
                        </div>
                        <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{itemTotal.toFixed(2)} Birr</span>
                      </div>

                      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '10px', color: '#6c757d', display: 'block', marginBottom: '2px' }}>Sold at</label>
                          <input
                            type="date"
                            value={item.soldAtDate}
                            onChange={(e) => updateSoldAtDate(itemId, e.target.value)}
                            style={{ width: '100%', padding: '3px 4px', fontSize: '10px', border: '1px solid #ced4da', borderRadius: '4px', color: '#495057', boxSizing: 'border-box' }}
                          />
                        </div>
                        
                        {!isBuildingMode && (
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '10px', color: '#6c757d', display: 'block', marginBottom: '2px' }}>Exp Date</label>
                            <div style={{ fontSize: '11px', padding: '3px 4px', background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '4px', color: itemExpDate ? '#fd7e14' : '#6c757d', fontWeight: 'bold' }}>
                              {itemExpDate ? new Date(itemExpDate).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: '2px dashed #dee2e6', paddingTop: '10px', marginTop: 'auto' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#6c757d', display: 'block', marginBottom: '2px' }}>Discount</label>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      style={{ width: '70px', padding: '4px', fontSize: '11px', border: '1px solid #ced4da', borderRadius: '4px' }}
                    />
                    
                    <div style={{ display: 'flex', border: '1px solid #ced4da', borderRadius: '4px', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => setDiscountType('percent')}
                        style={{
                          border: 'none',
                          padding: '4px 8px',
                          fontSize: '10px',
                          background: discountType === 'percent' ? '#0d6efd' : '#f8f9fa',
                          color: discountType === 'percent' ? '#fff' : '#333',
                          cursor: 'pointer'
                        }}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType('fixed')}
                        style={{
                          border: 'none',
                          padding: '4px 8px',
                          fontSize: '10px',
                          background: discountType === 'fixed' ? '#0d6efd' : '#f8f9fa',
                          color: discountType === 'fixed' ? '#fff' : '#333',
                          cursor: 'pointer'
                        }}
                      >
                        Birr
                      </button>
                    </div>

                    <span style={{ fontSize: '11px', fontWeight: 'bold', marginLeft: 'auto', color: '#dc3545' }}>
                      -{discountBirr.toFixed(2)} Birr
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '10px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6c757d', marginBottom: '2px' }}>
                    <span>Subtotal:</span>
                    <span>{subtotal.toFixed(2)} Birr</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6c757d', marginBottom: '2px' }}>
                    <span>Discount ({discountType === 'percent' ? `${discountValue}%` : `${discountValue} Birr`}):</span>
                    <span>{discountBirr.toFixed(2)} Birr</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>
                    <span>Total:</span>
                    <span style={{ color: '#28a745' }}>{grandTotal.toFixed(2)} Birr</span>
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <label style={{ fontSize: '10px', color: '#6c757d', display: 'block', marginBottom: '4px' }}>Payment Method</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                    {['Cash', 'Bank', 'Telebirr'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        style={{
                          padding: '5px',
                          fontSize: '11px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          background: paymentMethod === method ? '#e8f5e9' : '#fff',
                          borderColor: paymentMethod === method ? '#28a745' : '#ced4da',
                          color: paymentMethod === method ? '#28a745' : '#333',
                          fontWeight: paymentMethod === method ? 'bold' : 'normal',
                          cursor: 'pointer'
                        }}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: loading ? '#6c757d' : '#28a745',
                    color: '#fff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '10px'
                  }}
                >
                  {loading ? 'Processing...' : 'Complete Sale'}
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Today's Sales Popup Modal */}
      {isSalesModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', width: '320px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>Today's Sales Breakdown</h4>
              <button onClick={() => setIsSalesModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ fontSize: '13px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
                <span>💵 Cash</span>
                <b>{Number(todaySales.cash || 0).toFixed(2)} Birr</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
                <span>🏦 Bank</span>
                <b>{Number(todaySales.bank || 0).toFixed(2)} Birr</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
                <span>📱 Telebirr</span>
                <b>{Number(todaySales.telebirr || 0).toFixed(2)} Birr</b>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', marginTop: '12px', color: '#28a745' }}>
              <span>Total</span>
              <span>{Number(todaySales.total || 0).toFixed(2)} Birr</span>
            </div>

            <button
              onClick={() => setIsSalesModalOpen(false)}
              style={{ width: '100%', marginTop: '15px', padding: '8px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default POS;