import React, { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

// 3ti languages er dictionary translations
const translations = {
  am: {
    title: "አቅራቢዎች (Suppliers)",
    subtitle: "የግዢ አቅራቢዎችን እዚህ ይመዝግቡ እና ያስተዳድሩ",
    addBtn: "+ አቅራቢ ጨምር",
    thName: "የአቅራቢ ስም",
    thPhone: "ስልክ ቁጥር",
    thLocation: "አድራሻ / ቦታ",
    thActions: "ተግባራት",
    noSuppliers: "ምንም አቅራቢ አልተመዘገበም።",
    btnEdit: "አስተካክል",
    btnDelete: "ሰርዝ",
    modalTitleAdd: "አዲስ አቅራቢ መመዝገቢያ",
    modalTitleEdit: "የአቅራቢ መረጃ ማስተካከያ",
    labelName: "የአቅራቢ ስም *",
    labelPhone: "ስልክ ቁጥር",
    labelLocation: "አድራሻ / ቦታ",
    placeholderName: "ምሳሌ፡ ጀነራል አቅራቢ",
    placeholderPhone: "ምሳሌ፡ +251 911 000 000",
    placeholderLocation: "ምሳሌ፡ አዲስ አበባ",
    btnCancel: "ሰርዝ",
    btnSave: "መዝግብ",
    btnUpdate: "አድስ",
    confirmDelete: "ይህንን አቅራቢ ለማጥፋት እርግጠኛ ነዎት?",
    errorDelete: "አቅራቢውን ማጥፋት አልተቻለም",
    errorSave: "መረጃውን ማስቀመጥ አልተቻለም"
  },
  om: {
    title: "Dhiyeessitoota (Suppliers)",
    subtitle: "Dhiyeessitoota bitachaa asitti galmeessaa fi bulchaa",
    addBtn: "+ Dhiyeessaa Dabali",
    thName: "MAQAA DHIYEESSAA",
    thPhone: "LAKKOOFSA BILBILAA",
    thLocation: "BAKKA / TEESSOO",
    thActions: "GOCHAALEE",
    noSuppliers: "Dhiyeessaan tokkollee hin galmeeffamne.",
    btnEdit: "Gulaali",
    btnDelete: "Haqi",
    modalTitleAdd: "Dhiyeessaa Haaraa Galmeessuu",
    modalTitleEdit: "Odeeffannoo Dhiyeessaa Gulaaluu",
    labelName: "Maqaa Dhiyeessaa *",
    labelPhone: "Lakkoofsa Bilbilaa",
    labelLocation: "Bakka / Teessoo",
    placeholderName: "Fakkeenya: General Supplier",
    placeholderPhone: "Fakkeenya: +251 911 000 000",
    placeholderLocation: "Fakkeenya: Finfinnee",
    btnCancel: "Dhiisi",
    btnSave: "Olka'i",
    btnUpdate: "Haaromsi",
    confirmDelete: "Dhiyeessaa kana haqaniif mirkanaa'aadhaa?",
    errorDelete: "Dhiyeessaa haquun hin danda'amne",
    errorSave: "Odeeffannoo olka'uun hin danda'amne"
  },
  en: {
    title: "Suppliers",
    subtitle: "Register and manage purchase suppliers here",
    addBtn: "+ Add Supplier",
    thName: "SUPPLIER NAME",
    thPhone: "PHONE",
    thLocation: "LOCATION",
    thActions: "ACTIONS",
    noSuppliers: "No suppliers registered yet.",
    btnEdit: "Edit",
    btnDelete: "Delete",
    modalTitleAdd: "Add New Supplier",
    modalTitleEdit: "Edit Supplier",
    labelName: "Supplier Name *",
    labelPhone: "Phone Number",
    labelLocation: "Location / Address",
    placeholderName: "e.g. General Supplier",
    placeholderPhone: "e.g. +251 911 000 000",
    placeholderLocation: "e.g. Addis Ababa",
    btnCancel: "Cancel",
    btnSave: "Save",
    btnUpdate: "Update",
    confirmDelete: "Are you sure you want to delete this supplier?",
    errorDelete: "Could not delete supplier",
    errorSave: "Could not save supplier data"
  }
};

function Suppliers() {
  // Multi-language state
  const [lang, setLang] = useState(() => localStorage.getItem('appLanguage') || 'am');
  const t = translations[lang] || translations.am;

  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: ''
  });

  // Authorization Header
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };
  
  // Suppliers data backend theke fetch
  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/suppliers`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (Array.isArray(data)) setSuppliers(data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  useEffect(() => {
    fetchSuppliers();

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

  const handleEdit = (sup) => {
    setEditingId(sup._id);
    setFormData({
      name: sup.name,
      phone: sup.phone || '',
      location: sup.location || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', phone: '', location: '' });
  };

  // Supplier Delete
  const handleDelete = async (id) => {
    if (window.confirm(t.confirmDelete)) {
      try {
        const res = await fetch(`${API_BASE_URL}/suppliers/${id}`, { 
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        
        if (res.ok) {
          fetchSuppliers();
        } else {
          const errData = await res.json();
          alert(errData.message || t.errorDelete);
        }
      } catch (err) {
        console.error('Error deleting supplier:', err);
      }
    }
  };

  // Supplier Create/Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `${API_BASE_URL}/suppliers/${editingId}`
        : `${API_BASE_URL}/suppliers`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        handleCloseModal();
        fetchSuppliers();
      } else {
        const errData = await res.json();
        alert(errData.message || t.errorSave);
      }
    } catch (err) {
      console.error('Error saving supplier:', err);
    }
  };

  return (
    <div style={{ padding: '24px', flex: 1, backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>{t.title}</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            {t.subtitle}
          </p>
        </div>

        <button
          onClick={() => { setEditingId(null); setShowModal(true); }}
          style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '9px 16px',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'background 0.2s'
          }}
        >
          {t.addBtn}
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', minWidth: '600px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>{t.thName}</th>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>{t.thPhone}</th>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>{t.thLocation}</th>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>{t.thActions}</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  {t.noSuppliers}
                </td>
              </tr>
            ) : (
              suppliers.map((sup) => (
                <tr key={sup._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '500', color: '#0f172a' }}>{sup.name}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{sup.phone || '-'}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{sup.location || '-'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      onClick={() => handleEdit(sup)}
                      style={{ background: 'transparent', color: '#2563eb', border: 'none', marginRight: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                    >
                      {t.btnEdit}
                    </button>
                    <button
                      onClick={() => handleDelete(sup._id)}
                      style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                    >
                      {t.btnDelete}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', color: '#0f172a', fontWeight: '600' }}>
              {editingId ? t.modalTitleEdit : t.modalTitleAdd}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px', display: 'block' }}>
                  {t.labelName}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.placeholderName}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px', display: 'block' }}>
                  {t.labelPhone}
                </label>
                <input
                  type="text"
                  placeholder={t.placeholderPhone}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px', display: 'block' }}>
                  {t.labelLocation}
                </label>
                <input
                  type="text"
                  placeholder={t.placeholderLocation}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                >
                  {t.btnCancel}
                </button>
                <button 
                  type="submit" 
                  style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                >
                  {editingId ? t.btnUpdate : t.btnSave}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Suppliers;