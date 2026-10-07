import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

// Multi-language UI texts for App component
const translations = {
  am: {
    main: "ዋና",
    inventory: "ዕቃዎችና ስቶክ",
    procurement: "ግዢና አቅርቦት",
    salesAndCustomers: "ሽያጭና ደንበኞች",
    pos: "Point of Sale",
    products: "ዕቃዎች (Products)",
    categories: "ምድቦች (Categories)",
    activityLogs: "📋 የእንቅስቃሴ መዝገብ",
    suppliers: "አቅራቢዎች",
    purchases: "የግዢ ትዕዛዞች",
    transfer: "ዝውውር (Transfer)",
    orders: "የሽያጭ መዝገብ",
    customers: "ደንበኞች",
    reports: "📊 ሪፖርትና ትርፍ",
    setting: "⚙️ Setting",
    howToUse: "አጠቃቀም 📹",
    userRole: "ተጠቃሚ",
    logout: "ውጣ",
    saleSuccess: "ሽያጩ በትክክለኛው ሁኔታ ተጠናቋል!",
    saleFailed: "ሽያጩ አልተሳካም፡",
    emptyCart: "እባክዎን አስቀድመው ዕቃ ወደ ካርት ያስገቡ!",
    serverError: "ከ server ጋር መገናኘት አልተቻለም",
    tutorialTitle: "📹 የስርዓቱ አጠቃቀም Tutorial",
    expiredTitle: "🔒 የወርሃዊ አገልግሎት ክፍያ ጊዜዎ አልቋል!",
    expiredMessage: "እባክዎን አገልግሎቱን ለመቀጠል ክፍያ ይፈፅሙ ወይም የስርዓቱን አስተዳዳሪ (Admin) ያነጋግሩ።"
  },
  om: {
    main: "GURMUU GURBAA",
    inventory: "QABEENYA FI INVENTORY",
    procurement: "BITAAN FI KAN BIRA",
    salesAndCustomers: "GURRAACHA FI MAAMILTOOTA",
    pos: "Gurgurtaa (POS)",
    products: "Oomshaalee (Products)",
    categories: "Gosa Oomshaa (Categories)",
    activityLogs: "📋 Galmee Socho'iinsaa",
    suppliers: "Dhiyeessitoota",
    purchases: "Ajaja Bittaa",
    transfer: "Dabarsu (Transfer)",
    orders: "Galmee Gurgurtaa",
    customers: "Maamiltoota",
    reports: "📊 Gabaasa fi Bu'aa",
    setting: "⚙️ Qindaa'ina",
    howToUse: "Akkaata Akka Fayyadaman 📹",
    userRole: "Fayyadamaa",
    logout: "Ba'i",
    saleSuccess: "Gurgurtaan milkaa'inaan xumurameera!",
    saleFailed: "Gurgurtaan hin milkaa'in:",
    emptyCart: "Maaloo jalqaba meeshaa gara kaartitti galchaa!",
    serverError: "Server waliin qunnamuu hin danda'amne",
    tutorialTitle: "📹 Tutorial Akkaata Fayyadamasaa",
    expiredTitle: "🔒 Yeroon Kaffaltii Keessanii Xumurameera!",
    expiredMessage: "Tajaajila itti fufsiisuuf maaloo kaffaltii raawwadhaa yookiin Admin qunnamaa."
  },
  en: {
    main: "MAIN",
    inventory: "INVENTORY",
    procurement: "PROCUREMENT",
    salesAndCustomers: "SALES & CUSTOMERS",
    pos: "Point of Sale",
    products: "Products",
    categories: "Categories",
    activityLogs: "📋 Activity Logs",
    suppliers: "Suppliers",
    purchases: "Purchase Orders",
    transfer: "Transfer",
    orders: "Orders",
    customers: "Customers",
    reports: "📊 Reports & Profit",
    setting: "⚙️ Setting",
    howToUse: "Tutorial 📹",
    userRole: "User",
    logout: "Logout",
    saleSuccess: "Sale completed successfully!",
    saleFailed: "Sale failed:",
    emptyCart: "Please add items to cart first!",
    serverError: "Unable to connect to server",
    tutorialTitle: "📹 System Tutorial",
    expiredTitle: "🔒 Subscription Expired!",
    expiredMessage: "Your monthly service plan has expired. Please make a payment or contact the system administrator to restore access."
  }
};

// 🌟 Top Subscription Warning Banner Component
function SubscriptionBanner({ warning }) {
  if (!warning || !warning.message) return null;

  return (
    <div 
      style={{
        backgroundColor: '#f59e0b',
        color: '#ffffff',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '13px',
        fontWeight: '600',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>⚠️</span>
        <span>{warning.message}</span>
      </div>
      <a 
        href="tel:+251900000000" 
        style={{
          backgroundColor: '#ffffff',
          color: '#b45309',
          padding: '4px 10px',
          borderRadius: '4px',
          textDecoration: 'none',
          fontSize: '11px',
          fontWeight: 'bold'
        }}
      >
        አሁኑኑ ይክፈሉ
      </a>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [todaySales, setTodaySales] = useState({ cash: 0, bank: 0, telebirr: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  // Subscription Expired & Warning States
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);
  const [expiredMessage, setExpiredMessage] = useState('');
  const [subscriptionWarning, setSubscriptionWarning] = useState(null);

  // App Language State
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem('appLanguage') || 'am');

  // Mobile Navigation Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // YouTube Tutorial Modal State
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Listen to Language Changes globally
  useEffect(() => {
    const handleLangChange = () => {
      setCurrentLang(localStorage.getItem('appLanguage') || 'am');
    };
    window.addEventListener('storage', handleLangChange);
    window.addEventListener('languageChanged', handleLangChange);
    return () => {
      window.removeEventListener('storage', handleLangChange);
      window.removeEventListener('languageChanged', handleLangChange);
    };
  }, []);

  const t = translations[currentLang] || translations.am;

  // Response Error & Warning Handler for Subscriptions
  const handleApiResponse = async (res) => {
    const data = await res.json().catch(() => ({}));
    
    // ቀሪ ቀናት ማስጠንቀቂያ ካለ ይያዛል
    if (data.subscriptionWarning) {
      setSubscriptionWarning(data.subscriptionWarning);
    }

    if (res.status === 403) {
      if (data.isExpired || data.message) {
        setIsSubscriptionExpired(true);
        setExpiredMessage(data.message || t.expiredMessage);
      }
      return false;
    }
    return true;
  };

  // URL ውስጥ /reset-password/ የሚል ካለ Token-ን መለየት
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/reset-password/')) {
      const token = path.split('/reset-password/')[1];
      if (token) {
        setResetToken(token);
      }
    }
  }, []);

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
      const res = await fetch(`${API_BASE_URL}/products`, {
        headers: getAuthHeaders()
      });
      const isValid = await handleApiResponse(res);
      if (isValid && res.ok) {
        const data = await res.clone().json().catch(() => []);
        setProducts(data);
      }
    } catch (err) {
      console.error("Products Fetch Error:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        headers: getAuthHeaders()
      });
      const isValid = await handleApiResponse(res);
      if (isValid && res.ok) {
        const data = await res.clone().json().catch(() => []);
        setCategories(data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchTodaySalesSummary = async () => {
    try {
      const rawType = localStorage.getItem('businessType') || 'pharmacy';
      const isBuildingMode = rawType.toLowerCase().includes('building');
      const currentBusinessType = isBuildingMode ? 'building_materials' : 'pharmacy';

      const res = await fetch(
        `${API_BASE_URL}/orders/today-summary?businessType=${currentBusinessType}`, 
        { headers: getAuthHeaders() }
      );

      const isValid = await handleApiResponse(res);
      if (isValid && res.ok) {
        const data = await res.clone().json().catch(() => ({ cash: 0, bank: 0, telebirr: 0, total: 0 }));
        setTodaySales(data);
      }
    } catch (err) {
      console.error("Error fetching sales summary:", err);
    }
  };

  // የሽያጭ ማጠቃለያ ፋንክሽን
  const handleCompleteSale = async (saleDetails) => {
    const itemsToProcess = saleDetails?.items || cart;

    if (itemsToProcess.length === 0) {
      alert(t.emptyCart);
      return;
    }

    setLoading(true);
    try {
      const rawSubtotal = Number(saleDetails.subtotal || 0);
      const rawDiscountAmount = Number(saleDetails.discountAmount || saleDetails.discount || 0);
      const rawDiscountValue = Number(saleDetails.discountValue || saleDetails.discountPercent || 0);

      const subtotalVal = Number(rawSubtotal.toFixed(2));
      const discountVal = Number(rawDiscountAmount.toFixed(2));
      const grandTotalVal = Number(saleDetails.grandTotal ?? Math.max(0, subtotalVal - discountVal).toFixed(2));

      const orderData = {
        items: itemsToProcess.map(item => ({
          product: item.productId || item._id,
          productId: item.productId || item._id,
          name: item.name || item.productName || '',
          price: Number(Number(item.customPrice || item.price || 0).toFixed(2)),
          boughtPrice: Number(Number(item.boughtPrice || item.costPrice || 0).toFixed(2)),
          cartQty: Number(item.cartQty || item.quantity || 1),
          quantity: Number(item.cartQty || item.quantity || 1)
        })),
        subtotal: subtotalVal,
        discountType: saleDetails.discountType || 'percent',
        discountValue: rawDiscountValue,
        discountAmount: discountVal,
        grandTotal: grandTotalVal,
        paymentMethod: saleDetails.paymentMethod || 'Cash',
        businessType: saleDetails.businessType || localStorage.getItem('businessType') || 'pharmacy',
        soldAtDate: saleDetails.soldAtDate || new Date().toISOString().split('T')[0]
      };

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
      });

      const isValid = await handleApiResponse(res);

      if (isValid) {
        if (res.ok) {
          alert(t.saleSuccess);
          setCart([]);
          fetchProducts();
          fetchTodaySalesSummary();
        } else {
          const errData = await res.json();
          alert(`${t.saleFailed} ${errData.message || errData.error || 'Server error'}`);
        }
      }
    } catch (err) {
      console.error('Sale completion error:', err);
      alert(t.serverError);
    } finally {
      setLoading(false);
    }
  };

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

  if (resetToken) {
    return (
      <ResetPassword 
        token={resetToken} 
        currentLang={currentLang}
        onBackToLogin={() => {
          setResetToken(null);
          window.history.pushState({}, '', '/');
        }} 
      />
    );
  }

  if (!user) {
    return <Login currentLang={currentLang} onLoginSuccess={(userData) => setUser(userData)} />;
  }

  const menuSections = [
    { title: t.main, items: [{ id: 'pos', label: t.pos }] },
    { 
      title: t.inventory, 
      items: [
        { id: 'products', label: t.products }, 
        { id: 'categories', label: t.categories },
        { id: 'activityLogs', label: t.activityLogs }
      ] 
    },
    { 
      title: t.procurement, 
      items: [
        { id: 'suppliers', label: t.suppliers }, 
        { id: 'purchases', label: t.purchases }, 
        { id: 'transfer', label: t.transfer }
      ] 
    },
    { 
      title: t.salesAndCustomers, 
      items: [
        { id: 'orders', label: t.orders }, 
        { id: 'customers', label: t.customers },
        { id: 'reports', label: t.reports }
      ] 
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f1f5f9', fontFamily: 'Inter, Segoe UI, sans-serif' }}>
      
      {/* 1. 5 የቀን ቀሪ ማስጠንቀቂያ Banner */}
      <SubscriptionBanner warning={subscriptionWarning} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Subscription Expired Fullscreen Lock Screen */}
        {isSubscriptionExpired && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            color: '#fff',
            textAlign: 'center'
          }}>
            <div style={{
              backgroundColor: '#1e293b',
              border: '1px solid #ef4444',
              borderRadius: '16px',
              padding: '30px 25px',
              maxWidth: '450px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.2)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f87171', marginBottom: '12px' }}>
                {t.expiredTitle}
              </h2>
              <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '25px' }}>
                {expiredMessage || t.expiredMessage}
              </p>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {t.logout}
              </button>
            </div>
          </div>
        )}

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
              zIndex: 1040
            }}
          />
        )}

        {/* Sidebar Navigation */}
        <div style={{ 
          width: '240px', 
          height: '100%', 
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
                fontSize: '12px'
              }}
            >
              {t.setting}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '8px 10px', borderRadius: '6px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <span style={{ fontSize: '16px' }}>👤</span>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{t.userRole}</div>
                </div>
              </div>
              <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#f59e0b', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                {t.logout}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', width: '100%' }} className="main-content-panel">
          
          <div style={{ backgroundColor: '#ffffff', padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                style={{ background: '#475569', color: '#fff', border: 'none', borderRadius: '5px', padding: '6px 10px', fontSize: '16px', cursor: 'pointer' }}
                className="hamburger-btn"
              >
                ☰
              </button>
              <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: 'clamp(14px, 3vw, 16px)' }}>AB Stock POS</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => setShowVideoModal(true)}
                style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}
              >
                {t.howToUse}
              </button>

              <button 
                onClick={() => handleNavClick('settings')}
                style={{ background: '#64748b', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                className="desktop-settings-btn"
              >
                {t.setting}
              </button>
            </div>
          </div>

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
                currentLang={currentLang}
              />
            )}
            {activeTab === 'products' && <Products products={products} refreshProducts={fetchProducts} currentLang={currentLang} />}
            {activeTab === 'categories' && <Categories categories={categories} refreshCategories={fetchCategories} currentLang={currentLang} />}
            {activeTab === 'activityLogs' && <ActivityLog API_BASE_URL={API_BASE_URL} currentLang={currentLang} />}
            {activeTab === 'suppliers' && <Suppliers currentLang={currentLang} />}
            {activeTab === 'purchases' && <PurchaseOrders currentLang={currentLang} />}
            {activeTab === 'transfer' && <Transfer currentLang={currentLang} />}
            {activeTab === 'orders' && <Orders currentLang={currentLang} />}
            {activeTab === 'customers' && <Customers currentLang={currentLang} />}
            {activeTab === 'reports' && <ReportsPage API_BASE_URL={API_BASE_URL} currentLang={currentLang} />}
            {activeTab === 'settings' && <Settings currentLang={currentLang} />}
          </div>

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
          justifyContent: 'center',
          zIndex: 9999,
          padding: '15px'
        }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '15px', width: '100%', maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>{t.tutorialTitle}</h3>
              <button onClick={() => setShowVideoModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>
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

      <style>{`
        @media (min-width: 768px) {
          .responsive-sidebar {
            position: relative !important;
            transform: none !important;
          }
          .hamburger-btn, .mobile-close-btn {
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