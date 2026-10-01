import React, { useState, useEffect } from 'react';
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
import ActivityLog from './components/ActivityLog';

// 1. API Base URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

function App() {
  const [user, setUser] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [todaySales, setTodaySales] = useState({ cash: 0, bank: 0, telebirr: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  // Mobile Navigation Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // YouTube Tutorial Modal State
  const [showVideoModal, setShowVideoModal] = useState(false);

  // 1. URL ውስጥ /reset-password/ የሚል ካለ Token-ን መለየት
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/reset-password/')) {
      const token = path.split('/reset-password/')[1];
      if (token) {
        setResetToken(token);
      }
    }
  }, []);

  // 2. Authorization Header
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
      const res = await fetch(`${API_BASE_URL}/products`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        console.error("Products fetching failed:", res.status);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        console.error("Categories fetching failed:", res.status);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchTodaySalesSummary = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/today-summary`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setTodaySales(data);
      } else {
        console.error("Sales summary fetching failed:", res.status);
      }
    } catch (err) {
      console.error("Error fetching sales summary:", err);
    }
  };

  // የሽያጭ ማጠቃለያ ፋንክሽን
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
        alert('ሽያጩ በተከከለ ሁኔታ ተጠናቋል!');
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

  // Logout ሲደረግ LocalStorage አፅድቆ ገጹን ሙሉ በሙሉ Reload ማድረግ
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // 3. Reset Password Token ካለ የ ResetPassword component-ን ብቻ ያሳያል
  if (resetToken) {
    return (
      <ResetPassword 
        token={resetToken} 
        onBackToLogin={() => {
          setResetToken(null);
          window.history.pushState({}, '', '/');
        }} 
      />
    );
  }

  // 4. user ከሌለ Login ማሳያ
  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  // Sidebar Menu Sections
  const menuSections = [
    { title: 'MAIN', items: [{ id: 'pos', label: 'Point of Sale' }] },
    { 
      title: 'INVENTORY', 
      items: [
        { id: 'products', label: 'Products' }, 
        { id: 'categories', label: 'Categories' },
        { id: 'activityLogs', label: '📋 Activity Logs' }
      ] 
    },
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
      
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 1040,
            display: 'block'
          }}
        />
      )}

      {/* Silver/Slate Sidebar Navigation */}
      <div style={{ 
        width: '240px', 
        height: '100vh', 
        backgroundColor: '#1e293b', 
        color: '#f8fafc', 
        padding: '15px 12px', 
        display: 'flex', 
        flexDirection: 'column', 
        flexShrink: 0, 
        boxSizing: 'border-box',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1050,
        transition: 'transform 0.3s ease-in-out',
        borderRight: '1px solid #334155',
        transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'
      }} className="responsive-sidebar">
        
        {/* Logo & Mobile Close Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0' }}>
            📦 ab Stock
          </h2>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
            className="mobile-close-btn"
          >
            ✖
          </button>
        </div>

        {/* Navigation Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, overflowY: 'auto' }}>
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.5px' }}>{section.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      padding: '10px 12px',
                      border: 'none',
                      background: activeTab === item.id ? '#334155' : 'transparent',
                      color: activeTab === item.id ? '#38bdf8' : '#cbd5e1',
                      textAlign: 'left',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: activeTab === item.id ? 'bold' : 'normal',
                      transition: 'background 0.2s, color 0.2s'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Bottom (User Info & Settings) */}
        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => handleNavClick('settings')} 
            style={{ 
              width: '100%', 
              padding: '8px 10px', 
              background: activeTab === 'settings' ? '#334155' : 'transparent', 
              border: '1px solid #475569', 
              color: '#e2e8f0', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              textAlign: 'left', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ⚙️ Setting
          </button>

          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justify: 'space-between', 
              background: '#0f172a', 
              padding: '8px 10px', 
              borderRadius: '6px',
              border: '1px solid #334155'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <span style={{ fontSize: '16px' }}>👤</span>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>User</div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              style={{ background: 'transparent', border: 'none', color: '#f59e0b', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', padding: '4px' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', width: '100%' }} className="main-content-panel">
        
        {/* Top Header */}
        <div style={{ backgroundColor: '#ffffff', padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              style={{
                background: '#475569',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                padding: '6px 10px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
              className="hamburger-btn"
            >
              ☰
            </button>
            <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: 'clamp(14px, 3vw, 16px)' }}>AB Stock POS</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => setShowVideoModal(true)}
              style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              አጠቃቀም 📹
            </button>

            <button 
              onClick={() => handleNavClick('settings')}
              style={{ background: '#64748b', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              className="desktop-settings-btn"
            >
              ⚙️ Setting
            </button>
          </div>
        </div>

        {/* Dynamic Page Views Container */}
        <div style={{ flex: 1, padding: 'clamp(10px, 2vw, 20px)', overflowY: 'auto', boxSizing: 'border-box' }}>
          {activeTab === 'pos' && (
            <POSpage 
              cart={cart} 
              setCart={setCart} 
              products={products}
              categories={categories}
              todaySales={todaySales}
              onCompleteSale={handleCompleteSale}
              loading={loading}
            />
          )}
          {activeTab === 'products' && <Products products={products} refreshProducts={fetchProducts} />}
          {activeTab === 'categories' && <Categories categories={categories} refreshCategories={fetchCategories} />}
          {activeTab === 'activityLogs' && <ActivityLog API_BASE_URL={API_BASE_URL} />}
          {activeTab === 'suppliers' && <Suppliers />}
          {activeTab === 'purchases' && <PurchaseOrders />}
          {activeTab === 'transfer' && <Transfer />}
          {activeTab === 'orders' && <Orders />}
          {activeTab === 'customers' && <Customers />}
          {activeTab === 'reports' && <ReportsPage API_BASE_URL={API_BASE_URL} />}
          {activeTab === 'settings' && <Settings />}
        </div>

      </div>

      {/* YouTube Tutorial Modal */}
      {showVideoModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          zIndex: 9999,
          padding: '15px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '15px',
            width: '100%',
            maxWidth: '700px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>📹 የስርዓቱ አጠቃቀም Tutorial</h3>
              <button 
                onClick={() => setShowVideoModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✖
              </button>
            </div>

            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                src="https://www.youtube.com/embed/1RCXr0oNXfQ" 
                title="System Tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Styles */}
      <style>{`
        @media (min-width: 768px) {
          .responsive-sidebar {
            position: relative !important;
            transform: none !important;
          }
          .hamburger-btn {
            display: none !important;
          }
          .mobile-close-btn {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-settings-btn {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}

export default App;