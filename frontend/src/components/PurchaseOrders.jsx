import React, { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

// 3ti languages er dictionary translations
const translations = {
  am: {
    title: "የግዢ ትዕዛዞች (Purchase Orders)",
    subtitle: "አዲስ የግዢ ትዕዛዝ በማዘጋጀት ምርት ያስገቡ።",
    subInfo: "ምርቱ በቀጥታ ወደ መጋዘንዎ ገቢ ይደረጋል።",
    btnCreate: "+ አዲስ ግዢ መዝግብ",
    btnImport: "📥 CSV አስገባ",
    thDate: "ቀን",
    thItems: "የተገዙ ምርቶች",
    thTotal: "ጠቅላላ ዋጋ",
    thSupplier: "አቅራቢ",
    thInvoice: "የኢንቮይስ ቁጥር",
    noOrders: "ምንም የተመዘገበ የግዢ መረጃ የለም።",
    modalTitle: "አዲስ የግዢ ትዕዛዝ መመዝገቢያ",
    labelSupplier: "አቅራቢ *",
    selectSupplier: "-- አቅራቢ ይምረጡ --",
    labelProduct: "ምርት *",
    selectProduct: "-- ምርት ይምረጡ --",
    labelQuantity: "ብዛት",
    labelUnitCost: "የአንዱ ዋጋ (ETB)",
    labelInvoice: "የኢንቮይስ ቁጥር (አማራጭ)",
    btnCancel: "ሰርዝ",
    btnSave: "ግዢውን አስቀምጥ",
    alertCsvSuccess: "የመረጃዎቹ የ CSV ግዢዎች በጥሩ ሁኔታ ተመዝግበዋል!",
    alertCsvFail: "ግዢዎችን ማስገባት አልተቻለም",
    alertCsvEmpty: "የመረጡት CSV ፋይል ባዶ ነው ወይም ትክክለኛ መረጃ አልያዘም።",
    alertCsvError: "CSV ፋይሉን በማንበብ ሂደት ላይ ስህተት ተፈጥሯል!",
    alertCreateFail: "Purchase Order ማስገባት አልተቻለም",
    itemText: "ምርት",
    itemsText: "ምርቶች",
    defaultProduct: "የገባ ምርት",
    defaultSupplier: "ጠቅላላ አቅራቢ"
  },
  om: {
    title: "Ajaja Bitachaa (Purchase Orders)",
    subtitle: "Ajaja bitachaa haaraa uumuudhaan meeshaa galchaa.",
    subInfo: "Meeshaan kallattiidhaan gara kuusaa keessaniitti ni dabalama.",
    btnCreate: "+ Bitaa Haaraa Galmeessi",
    btnImport: "📥 CSV Galchaa",
    thDate: "GUYYAA",
    thItems: "MEESHAALEE BITAAMAN",
    thTotal: "GATII WALIIGALAA",
    thSupplier: "DHIYEESSAA",
    thInvoice: "LAKKOOFSA INVOICE",
    noOrders: "Galmeen bitachaa tokkollee hin jiru.",
    modalTitle: "Ajaja Bitachaa Haaraa Galmeessuu",
    labelSupplier: "Dhiyeessaa *",
    selectSupplier: "-- Dhiyeessaa Filadhaa --",
    labelProduct: "Oomisha / Meeshaa *",
    selectProduct: "-- Oomisha Filadhaa --",
    labelQuantity: "Baay'ina",
    labelUnitCost: "Gatii Tokkoo (ETB)",
    labelInvoice: "Lakk. Invoice (Filiyaalii)",
    btnCancel: "Dhiisi",
    btnSave: "Bitaa Olka'i",
    alertCsvSuccess: "Odeeffannoon bitachaa CSV milkaa'inaan galmeeffameera!",
    alertCsvFail: "Bitachaa galchuurra dogoggorri jira",
    alertCsvEmpty: "Faayiliin CSV filattan duudaa dha ykn odeeffannoo sirrii hin qabu.",
    alertCsvError: "Faayilii CSV dubbisuu irratti dogoggorri uumameera!",
    alertCreateFail: "Ajaja bitachaa galchuu hin danda'amne",
    itemText: "Meeshaa",
    itemsText: "Meeshaalee",
    defaultProduct: "Meeshaa Galfame",
    defaultSupplier: "Dhiyeessaa Waliigalaa"
  },
  en: {
    title: "Purchase Orders",
    subtitle: "Add inventory by creating a purchase order.",
    subInfo: "Stock will be added directly to your warehouse.",
    btnCreate: "+ Create Purchase",
    btnImport: "📥 Import Purchases",
    thDate: "DATE",
    thItems: "PURCHASED ITEMS",
    thTotal: "TOTAL AMOUNT",
    thSupplier: "SUPPLIER",
    thInvoice: "INVOICE NUMBER",
    noOrders: "No purchases recorded yet.",
    modalTitle: "Create New Purchase",
    labelSupplier: "Supplier *",
    selectSupplier: "-- Select Supplier --",
    labelProduct: "Product *",
    selectProduct: "-- Select Product --",
    labelQuantity: "Quantity",
    labelUnitCost: "Unit Cost (ETB)",
    labelInvoice: "Invoice Number (Optional)",
    btnCancel: "Cancel",
    btnSave: "Save Purchase",
    alertCsvSuccess: "CSV purchase orders imported successfully!",
    alertCsvFail: "Failed to import purchases",
    alertCsvEmpty: "The selected CSV file is empty or formatted incorrectly.",
    alertCsvError: "Error occurred while reading the CSV file!",
    alertCreateFail: "Failed to create purchase order",
    itemText: "Item",
    itemsText: "Items",
    defaultProduct: "Imported Product",
    defaultSupplier: "General"
  }
};

function PurchaseOrders() {
  const [lang, setLang] = useState(() => localStorage.getItem('appLanguage') || 'am');
  const t = translations[lang] || translations.am;

  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    supplierName: '',
    productId: '',
    productName: '',
    quantity: 1,
    unitCost: 0,
    invoiceNumber: ''
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  const fetchData = async () => {
    try {
      const config = { headers: getAuthHeaders() };

      const [poRes, supRes, prodRes] = await Promise.all([
        fetch(`${API_BASE_URL}/purchase-orders`, config),
        fetch(`${API_BASE_URL}/suppliers`, config),
        fetch(`${API_BASE_URL}/products`, config)
      ]);

      const poData = await poRes.json();
      const supData = await supRes.json();
      const prodData = await prodRes.json();

      if (Array.isArray(poData)) setOrders(poData);
      if (Array.isArray(supData)) setSuppliers(supData);
      if (Array.isArray(prodData)) setProducts(prodData);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();

    const handleLangChange = () => {
      const savedLang = localStorage.getItem('appLanguage') || 'am';
      setLang(savedLang);
    };

    window.addEventListener('storage', handleLangChange);
    window.addEventListener('languageChanged', handleLangChange);

    return () => {
      window.removeEventListener('storage', handleLangChange);
      window.removeEventListener('languageChanged', handleLangChange);
    };
  }, []);

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r\n|\n/);
        const importedOrders = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || line.split(',');
          const cleanValues = values.map((val) => val.replace(/^"|"$/g, '').trim());

          if (cleanValues.length >= 2) {
            const qty = Number(cleanValues[1]) || 1;
            const uCost = Number(cleanValues[2]) || 0;

            importedOrders.push({
              productName: cleanValues[0] || t.defaultProduct,
              quantity: qty,
              unitCost: uCost,
              totalCost: qty * uCost,
              supplierName: cleanValues[3] || (suppliers.length > 0 ? suppliers[0].name : t.defaultSupplier),
              invoiceNumber: cleanValues[4] || `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            });
          }
        }

        if (importedOrders.length > 0) {
          const res = await fetch(`${API_BASE_URL}/purchase-orders/bulk`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(importedOrders)
          });

          if (res.ok) {
            alert(t.alertCsvSuccess);
            fetchData();
          } else {
            const errorData = await res.json().catch(() => ({}));
            alert(`${t.alertCsvFail}: ${errorData.message || 'Server Error'}`);
          }
        } else {
          alert(t.alertCsvEmpty);
        }
      } catch (err) {
        console.error('Error importing CSV:', err);
        alert(t.alertCsvError);
      }

      e.target.value = null;
    };
    reader.readAsText(file);
  };

  const handleProductSelect = (e) => {
    const selectedId = e.target.value;
    const selectedProd = products.find((p) => (p._id || p.id) === selectedId);
    if (selectedProd) {
      setFormData({
        ...formData,
        productId: selectedProd._id || selectedProd.id,
        productName: selectedProd.name,
        unitCost: selectedProd.boughtPrice || selectedProd.price || 0
      });
    } else {
      setFormData({ ...formData, productId: '', productName: '', unitCost: 0 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        unitCost: Number(formData.unitCost),
        totalCost: Number(formData.quantity) * Number(formData.unitCost)
      };

      const res = await fetch(`${API_BASE_URL}/purchase-orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ supplierName: '', productId: '', productName: '', quantity: 1, unitCost: 0, invoiceNumber: '' });
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`${t.alertCreateFail}: ${errData.message || 'Server Error'}`);
      }
    } catch (err) {
      console.error('Error creating purchase order:', err);
    }
  };

  return (
    <div style={{ padding: '16px', flex: 1, backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      <style>{`
        .po-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .po-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          width: auto;
        }
        .po-btn {
          flex: 1;
          justify-content: center;
          white-space: nowrap;
        }
        .form-grid-modal {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .modal-card {
          width: 95%;
          max-width: 420px;
        }
        @media (max-width: 600px) {
          .po-header {
            flex-direction: column;
            align-items: stretch;
          }
          .po-buttons {
            width: 100%;
          }
          .form-grid-modal {
            grid-template-columns: 1fr;
          }
          .modal-card {
            padding: 16px;
          }
        }
      `}</style>

      {/* Top Bar */}
      <div className="po-header">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>{t.title}</h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
            {t.subtitle}<br />
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{t.subInfo}</span>
          </p>
        </div>

        <div className="po-buttons">
          <button
            className="po-btn"
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '10px 14px',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {t.btnCreate}
          </button>

          <label
            className="po-btn"
            style={{
              backgroundColor: '#fff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '10px 14px',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {t.btnImport}
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', minWidth: '550px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 14px', fontWeight: '600' }}>{t.thDate}</th>
              <th style={{ padding: '10px 14px', fontWeight: '600' }}>{t.thItems}</th>
              <th style={{ padding: '10px 14px', fontWeight: '600' }}>{t.thTotal}</th>
              <th style={{ padding: '10px 14px', fontWeight: '600' }}>{t.thSupplier}</th>
              <th style={{ padding: '10px 14px', fontWeight: '600' }}>{t.thInvoice}</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '12px' }}>
                  {t.noOrders}
                </td>
              </tr>
            ) : (
              orders.map((po) => (
                <tr key={po._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', color: '#64748b' }}>
                    {new Date(po.createdAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: '500', color: '#0f172a' }}>
                    {po.quantity} {po.quantity > 1 ? t.itemsText : t.itemText} ({po.productName})
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: '500', color: '#0f172a' }}>
                    ETB {po.totalCost ? po.totalCost.toLocaleString() : (po.quantity * po.unitCost || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{po.supplierName}</td>
                  <td style={{ padding: '12px 14px', color: '#64748b', fontFamily: 'monospace' }}>
                    {po.invoiceNumber || 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '10px' }}>
          <div className="modal-card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxSizing: 'border-box' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '15px', color: '#0f172a', fontWeight: '600' }}>
              {t.modalTitle}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '4px', display: 'block' }}>
                  {t.labelSupplier}
                </label>
                <select
                  required
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  <option value="">{t.selectSupplier}</option>
                  {suppliers.map((s) => (
                    <option key={s._id || s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '4px', display: 'block' }}>
                  {t.labelProduct}
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={handleProductSelect}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  <option value="">{t.selectProduct}</option>
                  {products.map((p) => (
                    <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-grid-modal">
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '4px', display: 'block' }}>
                    {t.labelQuantity}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '4px', display: 'block' }}>
                    {t.labelUnitCost}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '4px', display: 'block' }}>
                  {t.labelInvoice}
                </label>
                <input
                  type="text"
                  placeholder="INV-XXXXXX"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                >
                  {t.btnCancel}
                </button>
                <button 
                  type="submit" 
                  style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                >
                  {t.btnSave}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default PurchaseOrders;