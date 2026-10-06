import React, { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

// 3ti languages er dictionary translations
const translations = {
  am: {
    title: "የሽያጭ ደረሰኞች (Invoices)",
    pharmacyBadge: "💊 የፋርማሲ ሁነታ",
    buildingBadge: "🏗️ የሕንፃ መሣሪያ ሁነታ",
    searchPlaceholder: "በመለያ ቁጥር ወይም በምርት ስም ፈልግ...",
    thOrderId: "ትዕዛዝ ቁጥር",
    thProduct: "ምርት",
    thQuantity: "ብዛት",
    thPrice: "ዋጋ",
    thGrandTotal: "ጠቅላላ ዋጋ",
    thDiscount: "ቅናሽ",
    thPayment: "ክፍያ",
    thCompletedBy: "ያጠናቀቀው ሰው",
    noOrders: "ምንም የተመዘገበ የሽያጭ ደረሰኝ አልተገኘም።",
    multiple: "በርካታ",
    birr: "ብር",
    cash: "በጥሬ ገንዘብ"
  },
  om: {
    title: "Nagahee Gurgurtaa (Invoices)",
    pharmacyBadge: "💊 Haala Faarmaasii",
    buildingBadge: "🏗️ Haala Meeshaa Ijaarsaa",
    searchPlaceholder: "Lakk. ajajaan ykn maqaa oomishaatiin barbaadi...",
    thOrderId: "LAKK. AJAJAA",
    thProduct: "OOMISHA",
    thQuantity: "BAY'INA",
    thPrice: "GATIIN",
    thGrandTotal: "DIMSHAASHA GATII",
    thDiscount: "HIR'ISA",
    thPayment: "KAFFALTII",
    thCompletedBy: "NAMICHA XUMURE",
    noOrders: "Galmeen nagahee gurgurtaa tokkollee hin jiru.",
    multiple: "Dablaa",
    birr: "Birr",
    cash: "Kaffaltii Harkaa"
  },
  en: {
    title: "Invoices",
    pharmacyBadge: "💊 Pharmacy Mode",
    buildingBadge: "🏗️ Building Materials Mode",
    searchPlaceholder: "Search by ID or product name...",
    thOrderId: "ORDER #",
    thProduct: "PRODUCT",
    thQuantity: "QUANTITY",
    thPrice: "PRICE",
    thGrandTotal: "GRAND TOTAL",
    thDiscount: "DISCOUNT",
    thPayment: "PAYMENT",
    thCompletedBy: "COMPLETED BY",
    noOrders: "No orders found.",
    multiple: "Multiple",
    birr: "Birr",
    cash: "Cash"
  }
};

function Orders() {
  // Multi-language state
  const [lang, setLang] = useState(() => localStorage.getItem('appLanguage') || 'am');
  const t = translations[lang] || translations.am;

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Business Type State (pharmacy / building_materials)
  const [businessType, setBusinessType] = useState(
    localStorage.getItem('businessType') || 'pharmacy'
  );

  const isBuilding = businessType === 'building' || businessType === 'building_materials' || businessType === 'buildingMaterials';
  const currentBusinessType = isBuilding ? 'building_materials' : 'pharmacy';

  // Authorization Header Helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    fetchOrders();

    // Event Listeners for Storage, Mode change and Language change
    const handleModeChange = () => {
      const mode = localStorage.getItem('businessType') || 'pharmacy';
      setBusinessType(mode);
    };

    const handleLangChange = () => {
      const savedLang = localStorage.getItem('appLanguage') || 'am';
      setLang(savedLang);
    };

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
  }, [businessType]);

  // Fetch Orders from Backend (Filtered by active businessType)
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders?businessType=${currentBusinessType}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // Search & Date Filter Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some(item => 
        (item.name || item.productName)?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    let matchesDate = true;
    if (selectedDate) {
      let rawDate = order.soldAtDate || order.createdAt;
      let orderDate = '';
      
      if (rawDate) {
        orderDate = typeof rawDate === 'string' && rawDate.includes('T') 
          ? rawDate.split('T')[0] 
          : rawDate.substring(0, 10);
      }
      
      matchesDate = orderDate === selectedDate;
    }

    return matchesSearch && matchesDate;
  });

  return (
    <div style={{ padding: '25px', backgroundColor: '#f8f9fa', flex: 1, overflowY: 'auto', boxSizing: 'border-box', width: '100%', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Dynamic Style injection for responsiveness */}
      <style>{`
        .orders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .orders-controls {
          display: flex;
          gap: 10px;
          align-items: center;
          width: 100%;
          max-width: 480px;
        }
        .orders-controls input {
          flex: 1;
        }
        .table-container {
          background-color: #fff;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          overflow-x: auto;
          width: 100%;
        }
        .orders-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13px;
          min-width: 750px;
        }
        @media (max-width: 600px) {
          .orders-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .orders-controls {
            width: 100%;
            flex-direction: column;
          }
          .orders-controls input {
            width: 100% !important;
          }
        }
      `}</style>

      {/* Header & Controls */}
      <div className="orders-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#212529', margin: 0 }}>{t.title}</h2>
          <span style={{ fontSize: '11px', color: '#0d6efd', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-block', marginTop: '4px' }}>
            {isBuilding ? t.buildingBadge : t.pharmacyBadge}
          </span>
        </div>
        
        <div className="orders-controls">
          {/* Date Selector */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '5px',
              border: '1px solid #ced4da',
              fontSize: '13px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          />

          {/* Search Box */}
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '5px',
              border: '1px solid #ced4da',
              fontSize: '13px',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', color: '#6c757d', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 15px' }}>{t.thOrderId}</th>
              <th style={{ padding: '12px 15px' }}>{t.thProduct}</th>
              <th style={{ padding: '12px 15px' }}>{t.thQuantity}</th>
              <th style={{ padding: '12px 15px' }}>{t.thPrice}</th>
              <th style={{ padding: '12px 15px' }}>{t.thGrandTotal}</th>
              <th style={{ padding: '12px 15px' }}>{t.thDiscount}</th>
              <th style={{ padding: '12px 15px' }}>{t.thPayment}</th>
              <th style={{ padding: '12px 15px' }}>{t.thCompletedBy}</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                  {t.noOrders}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order, idx) => {
                const totalQty = order.items?.reduce((sum, item) => sum + (item.cartQty || item.quantity || 1), 0) || 1;
                
                const productNames = order.items?.map(i => {
                  const pName = i.name || i.productName || 'N/A';
                  const qty = i.cartQty || i.quantity || 1;
                  return qty > 1 ? `${pName} * ${qty}` : pName;
                }).join(', ') || 'N/A';

                const displayPrice = order.items && order.items.length === 1
                  ? `${order.items[0].price || 0} ${t.birr}`
                  : t.multiple;

                const userName = typeof order.user === 'object' 
                  ? (order.user?.name || order.user?.username || 'N/A')
                  : (order.completedBy || 'N/A');

                return (
                  <tr key={order._id || idx} style={{ borderBottom: '1px solid #f1f3f5' }}>
                    <td style={{ padding: '12px 15px', fontWeight: 'bold', color: '#495057' }}>
                      {order.orderId || (order._id ? order._id.substring(order._id.length - 6).toUpperCase() : `ORD-${idx + 1}`)}
                    </td>
                    <td style={{ padding: '12px 15px', color: '#495057' }}>
                      {productNames}
                    </td>
                    <td style={{ padding: '12px 15px', color: '#495057' }}>
                      {totalQty}
                    </td>
                    <td style={{ padding: '12px 15px', color: '#495057' }}>
                      {displayPrice}
                    </td>
                    <td style={{ padding: '12px 15px', color: '#28a745', fontWeight: 'bold' }}>
                      {order.grandTotal || order.subtotal || 0} {t.birr}
                    </td>
                    <td style={{ padding: '12px 15px', color: '#dc3545' }}>
                      {order.discountAmount || 0} {t.birr}
                    </td>
                    <td style={{ padding: '12px 15px', color: '#198754', fontWeight: '500' }}>
                      {order.paymentMethod || t.cash}
                    </td>
                    <td style={{ padding: '12px 15px', color: '#495057' }}>
                      {userName}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Orders;