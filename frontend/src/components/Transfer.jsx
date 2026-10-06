import React, { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

// 3ti languages er dictionary translations
const translations = {
  am: {
    title: "የምርት ዝውውር (Product Transfer)",
    pharmacyBadge: "💊 የፋርማሲ ሁነታ",
    buildingBadge: "🏗️ የሕንፃ መሣሪያ ሁነታ",
    subtitle: "ምርቶችን ከመጋዘን ወደ ሱቅ ወይም ከሱቅ ወደ መጋዘን ያዛውሩ።",
    subInfo: "ከመጋዘን ወደ ሱቅ የተዛወሩ ምርቶች በቀጥታ ሽያጭ ገጽ ላይ ይጨመራሉ።",
    btnTransfer: "+ ምርት አዛውር",
    thDate: "ቀን",
    thFrom: "ከወዴት (FROM)",
    thTo: "ወደ የት (TO)",
    thBy: "ያዛወረው ሰው",
    noRecords: "ምንም የተመዘገበ የዝውውር መረጃ አልተገኘም።",
    modalTitle: "አዲስ ምርት ማዛወሪያ",
    labelFrom: "ከወዴት (From)",
    labelTo: "ወደ የት (To)",
    labelBy: "ያዛወረው ሰው (Transferred By)",
    optStore: "መጋዘን (Store)",
    optStock: "ስታክ (Stock)",
    optShop: "ሱቅ (Shop)",
    btnCancel: "ሰርዝ",
    btnSubmit: "አስገባ",
    modePharmacy: "ፋርማሲ",
    modeBuilding: "ሕንፃ መሣሪያ"
  },
  om: {
    title: "Dabarsa Oomishaa (Product Transfer)",
    pharmacyBadge: "💊 Haala Faarmaasii",
    buildingBadge: "🏗️ Haala Meeshaa Ijaarsaa",
    subtitle: "Oomishaalee kuusaa irraa gara suuqii ykn suuqii irraa gara kuusaatti dabarsaa.",
    subInfo: "Oomishaaleen kuusaa irraa gara suuqii darban fuula gurgurtaa irratti dabalamu.",
    btnTransfer: "+ Oomisha Dabarsi",
    thDate: "GUYYAA",
    thFrom: "IRRAA (FROM)",
    thTo: "GARA (TO)",
    thBy: "NAMICHA DABARSE",
    noRecords: "Galmeen dabarsa oomishaa tokkollee hin jiru.",
    modalTitle: "Dabarsa Oomishaa Haaraa",
    labelFrom: "Irraa (From)",
    labelTo: "Gara (To)",
    labelBy: "Namicha Dabarse (Transferred By)",
    optStore: "Kuusaa (Store)",
    optStock: "Stookii (Stock)",
    optShop: "Suuqii (Shop)",
    btnCancel: "Dhiisi",
    btnSubmit: "Galchi",
    modePharmacy: "Faarmaasii",
    modeBuilding: "Meeshaa Ijaarsaa"
  },
  en: {
    title: "Product Transfer",
    pharmacyBadge: "💊 Pharmacy Mode",
    buildingBadge: "🏗️ Building Materials Mode",
    subtitle: "Transfer products from store to shop or from shop to store.",
    subInfo: "Products transferred from store to shop will be added to your sales page.",
    btnTransfer: "+ Transfer Product",
    thDate: "DATE",
    thFrom: "FROM",
    thTo: "TO",
    thBy: "BY",
    noRecords: "No transfer records found.",
    modalTitle: "New Transfer",
    labelFrom: "From",
    labelTo: "To",
    labelBy: "Transferred By",
    optStore: "Store",
    optStock: "Stock",
    optShop: "Shop",
    btnCancel: "Cancel",
    btnSubmit: "Submit",
    modePharmacy: "Pharmacy",
    modeBuilding: "Building Materials"
  }
};

function Transfer() {
  // Multi-language state
  const [lang, setLang] = useState(() => localStorage.getItem('appLanguage') || 'am');
  const t = translations[lang] || translations.am;

  const [transfers, setTransfers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Business type switch (pharmacy / building_materials)
  const [businessType, setBusinessType] = useState(
    localStorage.getItem('businessType') || 'pharmacy'
  );

  const isBuilding = businessType === 'building' || businessType === 'building_materials' || businessType === 'buildingMaterials';
  const currentBusinessType = isBuilding ? 'building_materials' : 'pharmacy';

  const [formData, setFormData] = useState({
    from: 'store',
    to: 'shop',
    transferredBy: 'ab'
  });

  // Authorization Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  // Sync mode & language changes
  useEffect(() => {
    const handleModeChange = () => {
      const currentMode = localStorage.getItem('businessType') || 'pharmacy';
      setBusinessType(currentMode);
    };

    const handleLangChange = () => {
      const savedLang = localStorage.getItem('appLanguage') || 'am';
      setLang(savedLang);
    };

    window.addEventListener('businessTypeChanged', handleModeChange);
    window.addEventListener('languageChanged', handleLangChange);
    window.addEventListener('storage', handleModeChange);
    window.addEventListener('storage', handleLangChange);

    return () => {
      window.removeEventListener('businessTypeChanged', handleModeChange);
      window.removeEventListener('languageChanged', handleLangChange);
      window.removeEventListener('storage', handleModeChange);
      window.removeEventListener('storage', handleLangChange);
    };
  }, []);

  // Fetch transfers based on active business type
  useEffect(() => {
    fetchTransfers();
  }, [businessType]);

  const fetchTransfers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/transfers?businessType=${currentBusinessType}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const filtered = data.filter((item) => {
          const type = (item.businessType || '').toLowerCase();
          if (isBuilding) {
            return type === 'building_materials' || type.includes('building');
          }
          return type === 'pharmacy' || type === '' || !item.businessType;
        });
        setTransfers(filtered);
      }
    } catch (err) {
      console.error('Error fetching transfers:', err);
    }
  };

  // Create new transfer submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        businessType: currentBusinessType
      };

      const res = await fetch(`${API_BASE_URL}/transfers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        fetchTransfers();
      }
    } catch (err) {
      console.error('Error creating transfer:', err);
    }
  };

  return (
    <div style={{ padding: '25px', backgroundColor: '#f8f9fa', flex: 1, overflowY: 'auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#212529', margin: 0 }}>{t.title}</h2>
          <span style={{ fontSize: '11px', color: '#0d6efd', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-block', marginTop: '4px' }}>
            {isBuilding ? t.buildingBadge : t.pharmacyBadge}
          </span>
          <p style={{ fontSize: '13px', color: '#6c757d', margin: '5px 0 0 0' }}>
            {t.subtitle}<br />
            <span style={{ fontSize: '12px', color: '#8c98a4' }}>
              {t.subInfo}
            </span>
          </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          style={{
            backgroundColor: '#0d6efd',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          {t.btnTransfer}
        </button>
      </div>

      {/* Table Section */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e9ecef', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', minWidth: '550px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', color: '#6c757d', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 15px' }}>{t.thDate}</th>
              <th style={{ padding: '12px 15px' }}>{t.thFrom}</th>
              <th style={{ padding: '12px 15px' }}>{t.thTo}</th>
              <th style={{ padding: '12px 15px' }}>{t.thBy}</th>
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                  {t.noRecords} ({isBuilding ? t.modeBuilding : t.modePharmacy})
                </td>
              </tr>
            ) : (
              transfers.map((item, idx) => (
                <tr key={item._id || idx} style={{ borderBottom: '1px solid #f1f3f5' }}>
                  <td style={{ padding: '12px 15px', color: '#495057' }}>
                    {new Date(item.date || item.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 15px', color: '#495057', textTransform: 'capitalize' }}>{item.from}</td>
                  <td style={{ padding: '12px 15px', color: '#495057', textTransform: 'capitalize' }}>{item.to}</td>
                  <td style={{ padding: '12px 15px', color: '#495057' }}>{item.transferredBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Transfer Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '10px' }}>
          <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '400px', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', boxSizing: 'border-box' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px', color: '#212529' }}>
              {t.modalTitle} ({isBuilding ? t.modeBuilding : t.modePharmacy})
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold', color: '#495057' }}>
                  {t.labelFrom}
                </label>
                <select 
                  value={formData.from}
                  onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  <option value="store">{t.optStore}</option>
                  <option value="stock">{t.optStock}</option>
                  <option value="shop">{t.optShop}</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold', color: '#495057' }}>
                  {t.labelTo}
                </label>
                <select 
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  <option value="shop">{t.optShop}</option>
                  <option value="stock">{t.optStock}</option>
                  <option value="store">{t.optStore}</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold', color: '#495057' }}>
                  {t.labelBy}
                </label>
                <input 
                  type="text"
                  required
                  value={formData.transferredBy}
                  onChange={(e) => setFormData({ ...formData, transferredBy: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  style={{ padding: '6px 12px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                >
                  {t.btnCancel}
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '6px 12px', border: 'none', background: '#0d6efd', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                >
                  {t.btnSubmit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Transfer;