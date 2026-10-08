import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { translations } from './pos/translations';
import ProductCard from './pos/ProductCard';
import CartPanel from './pos/CartPanel';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

function POS({ cart = [], setCart, onCompleteSale, loading }) {
  const [lang, setLang] = useState(() => localStorage.getItem('appLanguage') || 'am');
  const t = translations[lang] || translations.am;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paidAmountInput, setPaidAmountInput] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const [todaySales, setTodaySales] = useState({ cash: 0, bank: 0, telebirr: 0, total: 0 });
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);

  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState('percent');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const rawType = localStorage.getItem('businessType') || 'pharmacy';
  const isBuildingMode = rawType.toLowerCase().includes('building');
  const currentBusinessType = isBuildingMode ? 'building_materials' : 'pharmacy';

  const getLocalTodayDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const todayDateString = getLocalTodayDate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { 'Authorization': token ? `Bearer ${token}` : '' } };
  };

  const fetchData = async () => {
    try {
      const config = getAuthHeaders();
      const [prodRes, catRes, salesRes, custRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products?businessType=${currentBusinessType}`, config),
        axios.get(`${API_BASE_URL}/categories?businessType=${currentBusinessType}`, config),
        axios.get(`${API_BASE_URL}/orders/today-summary?businessType=${currentBusinessType}`, config).catch(() => ({ data: { cash: 0, bank: 0, telebirr: 0, total: 0 } })),
        axios.get(`${API_BASE_URL}/customers`, config).catch(() => ({ data: [] }))
      ]);

      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
      if (salesRes.data) setTodaySales(salesRes.data);
      if (custRes.data) setCustomers(custRes.data);
    } catch (err) {
      console.error('Error fetching POS data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const handleModeChange = () => fetchData();
    const handleLangChange = () => setLang(localStorage.getItem('appLanguage') || 'am');

    window.addEventListener('storage', handleModeChange);
    window.addEventListener('storage', handleLangChange);
    window.addEventListener('businessTypeChanged', handleModeChange);
    window.addEventListener('languageChanged', handleLangChange);

    return () => {
      window.removeEventListener('storage', handleModeChange);
      window.removeEventListener('storage', handleLangChange);
      window.removeEventListener('businessTypeChanged', handleModeChange);
      window.removeEventListener('languageChanged', handleLangChange);
    };
  }, [rawType]);

  const addToCart = (product) => {
    const stockQty = product.quantity ?? product.inShop ?? product.stock ?? 0;
    if (stockQty <= 0) return alert(t.outOfStock || 'Out of stock');

    const productId = product._id || product.id;
    const existingIndex = cart.findIndex((item) => (item._id || item.id) === productId);

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      if (updatedCart[existingIndex].cartQty + 1 > stockQty) return alert(t.stockLimitExceeded || 'Limit reached');
      updatedCart[existingIndex].cartQty += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, productId, cartQty: 1, customPrice: product.price, soldAtDate: todayDateString, expiryDate: product.expiryDate || product.expirationDate || '' }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map((item) => {
      if ((item._id || item.id) === id) {
        const newQty = item.cartQty + delta;
        const stockQty = item.quantity ?? item.inShop ?? item.stock ?? 999;
        if (newQty > stockQty) { alert(t.stockLimitExceeded || 'Limit reached'); return item; }
        return newQty > 0 ? { ...item, cartQty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const updateSoldAtDate = (id, dateValue) => {
    setCart(cart.map((item) => (item._id || item.id) === id ? { ...item, soldAtDate: dateValue } : item));
  };

  const removeFromCart = (id) => setCart(cart.filter((item) => (item._id || item.id) !== id));

  const subtotalRaw = cart.reduce((sum, item) => sum + (Number(item.customPrice || item.price || 0) * item.cartQty), 0);
  const subtotal = Number(subtotalRaw.toFixed(2));
  const calculatedDiscount = discountType === 'percent' ? (subtotal * Number(discountValue || 0)) / 100 : Number(discountValue || 0);
  const discountBirr = Number(Math.min(calculatedDiscount, subtotal).toFixed(2));
  const grandTotal = Number(Math.max(0, subtotal - discountBirr).toFixed(2));

  const handleCheckout = async () => {
    if (cart.length === 0) return alert(t.cartIsEmpty || 'Cart is empty');

    const isCredit = paymentMethod.toLowerCase() === 'credit';
    if (isCredit && !selectedCustomer) {
      return alert('እባክዎ ደንበኛ ይምረጡ / Please select a customer');
    }

    const paid = isCredit ? Number(paidAmountInput || 0) : grandTotal;
    const remaining = Math.max(0, grandTotal - paid);
    let status = 'Paid';
    if (isCredit) {
      if (paid === 0) status = 'Unpaid';
      else if (paid < grandTotal) status = 'Partial';
    }

    try {
      const orderPayload = {
        items: cart.map(item => ({
          ...item,
          productId: item.productId || item._id,
          productName: item.name || item.productName || '',
          price: Number(Number(item.customPrice || item.price || 0).toFixed(2)),
          boughtPrice: item.boughtPrice || item.costPrice || 0,
          cartQty: item.cartQty,
          quantity: item.cartQty
        })),
        subtotal,
        discountType,
        discountValue: Number(discountValue || 0),
        discountAmount: discountBirr,
        grandTotal,
        paymentMethod: paymentMethod.toLowerCase(),
        paymentStatus: status,
        customer: isCredit ? selectedCustomer : undefined,
        paidAmount: paid,
        remainingAmount: remaining,
        dueDate: isCredit && dueDateInput ? dueDateInput : undefined,
        businessType: currentBusinessType,
        soldAtDate: todayDateString
      };

      if (onCompleteSale) {
        await onCompleteSale(orderPayload);
      } else {
        await axios.post(`${API_BASE_URL}/orders`, orderPayload, getAuthHeaders());
        alert(t.saleSuccess || 'Sale completed successfully');
        setCart([]);
        setSelectedCustomer('');
        setPaidAmountInput('');
        setDueDateInput('');
      }
      await fetchData();
    } catch (err) {
      alert(t.checkoutFailed || 'Checkout failed');
    }
  };

  const isProductLowStock = (p) => {
    const qty = p.quantity ?? p.inShop ?? p.stock ?? 0;
    const threshold = Number(p.stockThreshold);
    return (!isNaN(threshold) && threshold > 0) ? qty < threshold : qty < 5;
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = !p.name || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || p.category === selectedCategory;
    const matchesLowStock = showLowStockOnly ? isProductLowStock(p) : true;
    const prodType = (p.businessType || p.businessMode || '').toLowerCase();
    const matchesMode = isBuildingMode 
      ? (prodType.includes('building') || Boolean(p.materialType) || Boolean(p.unit) || (!p.specificType && !p.expiryDate))
      : (prodType.includes('pharmacy') || Boolean(p.specificType) || Boolean(p.expiryDate));

    return matchesSearch && matchesCategory && matchesLowStock && matchesMode;
  });

  const lowStockCount = products.filter(p => isProductLowStock(p)).length;

  return (
    <div style={{ padding: '20px', flex: 1, background: '#f4f6f8', fontFamily: 'sans-serif' }}>
      
      {/* Search Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', background: '#fff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #ced4da', flex: '1 1 300px' }}>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '13px' }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ borderLeft: '1px solid #e0e0e0', borderTop: 'none', borderRight: 'none', borderBottom: 'none', outline: 'none', fontSize: '13px' }}
          >
            <option value="All Categories">{t.allCategories}</option>
            {categories.map((cat) => <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div onClick={() => setIsSalesModalOpen(true)} style={{ background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e0e0e0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: 'bold' }}>{t.todaysSales}</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{Number(todaySales.total || 0).toFixed(2)} {t.birr}</div>
            </div>
            <span style={{ fontSize: '16px' }}>🛒</span>
          </div>
          <div onClick={() => setShowLowStockOnly(!showLowStockOnly)} style={{ background: showLowStockOnly ? '#ffebee' : '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e0e0e0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: 'bold' }}>{t.lowStock}</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#dc3545' }}>{lowStockCount}</div>
            </div>
            <span style={{ fontSize: '16px' }}>⚠️</span>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px', height: 'calc(100vh - 160px)' }}>
        
        {/* Products */}
        <div style={{ overflowY: 'auto', paddingRight: '5px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
            {filteredProducts.map((product) => {
              const productId = product._id || product.id;
              return (
                <ProductCard
                  key={productId}
                  product={product}
                  isAdded={cart.some((item) => (item._id || item.id) === productId)}
                  isLowStock={isProductLowStock(product)}
                  isBuildingMode={isBuildingMode}
                  addToCart={addToCart}
                  t={t}
                />
              );
            })}
          </div>
        </div>

        {/* Cart Panel & Credit Form Integration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {paymentMethod.toLowerCase() === 'credit' && (
            <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '6px', border: '1px solid #ffeeba', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <strong>📋 የዱቤ መረጃ፦</strong>
              <div>
                <label style={{ display: 'block', marginBottom: '2px' }}>ደንበኛ ይምረጡ፦</label>
                <select 
                  value={selectedCustomer} 
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">-- ደንበኛ ይምረጡ --</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '2px' }}>የከፈለው ገንዘብ፦</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={paidAmountInput} 
                    onChange={(e) => setPaidAmountInput(e.target.value)}
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '2px' }}>የቀጠሮ ቀን፦</label>
                  <input 
                    type="date" 
                    value={dueDateInput} 
                    onChange={(e) => setDueDateInput(e.target.value)}
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>
            </div>
          )}

          <CartPanel
            cart={cart}
            removeFromCart={removeFromCart}
            updateQty={updateQty}
            updateSoldAtDate={updateSoldAtDate}
            isBuildingMode={isBuildingMode}
            discountValue={discountValue}
            setDiscountValue={setDiscountValue}
            discountType={discountType}
            setDiscountType={setDiscountType}
            discountBirr={discountBirr}
            subtotal={subtotal}
            grandTotal={grandTotal}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            handleCheckout={handleCheckout}
            loading={loading}
            t={t}
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            paidAmount={paidAmountInput}
            setPaidAmount={setPaidAmountInput}
          />
        </div>
      </div>

      {/* Sales Summary Modal */}
      {isSalesModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', width: '350px', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>{t.todaysSalesBreakdown}</h3>
              <button onClick={() => setIsSalesModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span>💵 {t.cash}</span>
                <strong>{Number(todaySales.cash || 0).toFixed(2)} {t.birr}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span>🏦 {t.bank}</span>
                <strong>{Number(todaySales.bank || 0).toFixed(2)} {t.birr}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span>📱 {t.telebirr}</span>
                <strong>{Number(todaySales.telebirr || 0).toFixed(2)} {t.birr}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', color: '#28a745', fontSize: '15px', fontWeight: 'bold' }}>
                <span>{t.total}</span>
                <span>{Number(todaySales.total || 0).toFixed(2)} {t.birr}</span>
              </div>
            </div>

            <button onClick={() => setIsSalesModalOpen(false)} style={{ width: '100%', background: '#0d6efd', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', marginTop: '15px', cursor: 'pointer', fontWeight: 'bold' }}>
              {t.close}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default POS;