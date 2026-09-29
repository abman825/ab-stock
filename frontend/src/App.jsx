import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Components
import POSpage from './components/POSpage';
import Products from './components/Products';
import Categories from './components/Categories';
import Suppliers from './components/Suppliers';
import PurchaseOrders from './components/PurchaseOrders';
import Transfer from './components/Transfer';
import Orders from './components/Orders';
import Customers from './components/Customers';
import Settings from './components/Settings';
import Login from './components/Login';
import ReportsPage from './components/ReportsPage';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';

// API Base URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ab-stock.onrender.com';
const API_BASE_URL = `${BASE_URL}/api`;

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [todaySales, setTodaySales] = useState({ cash: 0, bank: 0, telebirr: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [authView, setAuthView] = useState('login'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Authorization Header
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchCategories();
      fetchTodaySalesSummary();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, { headers: getAuthHeaders() });
      if (res.ok) setProducts(await res.json());
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, { headers: getAuthHeaders() });
      if (res.ok) setCategories(await res.json());
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchTodaySalesSummary = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/today-summary`, { headers: getAuthHeaders() });
      if (res.ok) setTodaySales(await res.json());
    } catch (err) {
      console.error("Error fetching sales summary:", err);
    }
  };

  const handleCompleteSale = async (saleDetails) => {
    if (cart.length === 0) {
      alert('እባክዎን አስቀድመው እቃ ወደ ካርት ያስገቡ!');
      return;
    }

    setLoading(true);
    try {
      const rawSubtotal = Number(saleDetails.subtotal || saleDetails.grandTotal || 0);
      const rawDiscountAmount = Number(saleDetails.discountAmount || saleDetails.discount || 0);
      const rawDiscountPercent = Number(saleDetails.discountPercent || 0);

      const subtotalVal = Number(rawSubtotal.toFixed(2));
      const discountVal = Number(rawDiscountAmount.toFixed(2));
      const grandTotalVal = Number((subtotalVal - discountVal).toFixed(2));

      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: Number(Number(item.customPrice || item.price || 0).toFixed(2)),
          boughtPrice: Number(Number(item.boughtPrice || 0).toFixed(2)),
          cartQty: Number(item.cartQty || 1)
        })),
        subtotal: subtotalVal,
        discountPercent: rawDiscountPercent,
        discountAmount: discountVal,
        grandTotal: grandTotalVal,
        paymentMethod: saleDetails.paymentMethod || 'Cash',
        soldAtDate: saleDetails.soldAtDate || new Date().toISOString().split('T')[0]
      };

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        alert('ሽያጩ በትክክለኛ ሁኔታ ተጠናቋል!');
        setCart([]);
        fetchProducts();
        fetchTodaySalesSummary();
      } else {
        const errData = await res.json();
        alert(`ሽያጩ አልተሳካም: ${errData.message || errData.error}`);
      }
    } catch (err) {
      console.error('Sale completion error:', err);
      alert('ከ server ጋር መገናኘት አልተቻለም');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // URL Path ለ reset-password ከሆነ አሳይ
  if (location.pathname.startsWith('/reset-password')) {
    return <ResetPassword onBackToLogin={() => navigate('/')} />;
  }

  // User Authentication
  if (!user) {
    if (authView === 'forgot') {
      return <ForgotPassword onBackToLogin={() => setAuthView('login')} />;
    }
    return (
      <Login 
        onLoginSuccess={(userData) => setUser(userData)} 
        onForgotPassword={() => setAuthView('forgot')} 
      />
    );
  }

  const menuSections = [
    { title: 'MAIN', items: [{ id: 'pos', label: 'Point of Sale' }] },
    { title: 'INVENTORY', items: [{ id: 'products', label: 'Products' }, { id: 'categories', label: 'Categories' }] },
    { title: 'PROCUREMENT', items: [{ id: 'suppliers', label: 'Suppliers' }, { id: 'purchases', label: 'Purchase Orders' }, { id: 'transfer', label: 'Transfer' }] },
    { 
      title: 'SALES & CUSTOMERS', 
      items: [
        { id: 'orders', label: 'Orders' }, 
        { id: 'customers', label: 'Customers' },
        { id: 'reports', label: '📊 Reports & Profit' }
      ] 
    }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f1f5f9', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1040 }}
        />
      )}

      {/* Sidebar */}
      <div style={{ 
        width: '240px', height: '100vh', backgroundColor: '#1e293b', color: '#f8fafc', padding: '15px 12px', 
        display: 'flex', flexDirection: 'column', flexShrink: 0, boxSizing: 'border-box', position: 'fixed', 
        left: 0, top: 0, bottom: 0, zIndex: 1050, transition: 'transform 0.3s ease-in-out', borderRight: '1px solid #334155',
        transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'
      }} className="responsive-sidebar">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#e2e8f0' }}>📦 ab Stock</h2>
          <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }} className="mobile-close-btn">✖</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, overflowY: 'auto' }}>
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '6px' }}>{section.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      padding: '10px 12px', border: 'none',
                      background: activeTab === item.id ? '#334155' : 'transparent',
                      color: activeTab === item.id ? '#38bdf8' : '#cbd5e1',
                      textAlign: 'left', borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
                      fontWeight: activeTab === item.id ? 'bold' : 'normal'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => handleNavClick('settings')} style={{ width: '100%', padding: '8px 10px', background: activeTab === 'settings' ? '#334155' : 'transparent', border: '1px solid #475569', color: '#e2e8f0', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontSize: '12px' }}>
            ⚙️ Setting
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '8px 10px', borderRadius: '6px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <span>👤</span>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f1f5f9' }}>{user.username}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>User</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#f59e0b', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Logout</button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', width: '100%' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setIsMobileMenuOpen(true)} style={{ background: '#475569', color: '#fff', border: 'none', borderRadius: '5px', padding: '6px 10px', fontSize: '16px', cursor: 'pointer' }} className="hamburger-btn">☰</button>
            <span style={{ fontWeight: 'bold', color: '#1e293b' }}>AB Stock POS</span>
          </div>
          <button onClick={() => setShowVideoModal(true)} style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}>አጠቃቀም 📹</button>
        </div>

        <div style={{ flex: 1, padding: '15px', overflowY: 'auto' }}>
          {activeTab === 'pos' && <POSpage cart={cart} setCart={setCart} products={products} categories={categories} todaySales={todaySales} onCompleteSale={handleCompleteSale} loading={loading} />}
          {activeTab === 'products' && <Products products={products} refreshProducts={fetchProducts} />}
          {activeTab === 'categories' && <Categories categories={categories} refreshCategories={fetchCategories} />}
          {activeTab === 'suppliers' && <Suppliers />}
          {activeTab === 'purchases' && <PurchaseOrders />}
          {activeTab === 'transfer' && <Transfer />}
          {activeTab === 'orders' && <Orders />}
          {activeTab === 'customers' && <Customers />}
          {activeTab === 'reports' && <ReportsPage API_BASE_URL={API_BASE_URL} />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </div>

      {showVideoModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '15px', width: '100%', maxWidth: '700px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px' }}>📹 የስርዓቱ አጠቃቀም Tutorial</h3>
              <button onClick={() => setShowVideoModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
              <iframe style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} src="https://www.youtube.com/embed/1RCXr0oNXfQ" title="System Tutorial" allowFullScreen></iframe>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .responsive-sidebar { position: relative !important; transform: none !important; }
          .hamburger-btn, .mobile-close-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default App;