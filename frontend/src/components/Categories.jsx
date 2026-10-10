import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

const translations = {
  am: {
    buildingTitle: "የሕንፃ መሣሪያዎች ምድብ",
    pharmacyTitle: "የፋርማሲ ምድብ",
    searchPlaceholder: "ፈልግ...",
    addCategory: "+ ጨምር",
    import: "📥 አስገባ",
    export: "📤 ላክ",
    thCategoryId: "ID",
    thName: "ስም",
    thProducts: "ምርቶች",
    thActions: "ድርጊቶች",
    edit: "አስተካክል",
    delete: "ሰርዝ",
    noCategories: "ምንም ምድብ አልተገኘም።",
    editTitle: "ምድብ አስተካክል",
    addTitle: "ምድብ ጨምር",
    categoryIdLabel: "የምድብ መለያ (አማራጭ)",
    categoryNameLabel: "የምድብ ስም",
    buildingPlaceholder: "ምሳሌ፤ ሲሚንቶ፣ ብረት",
    pharmacyPlaceholder: "ምሳሌ፤ መድኃኒት፣ ሲሮፕ",
    cancel: "ሰርዝ",
    update: "አድስ",
    save: "አስቀምጥ",
    confirmDelete: "እርግጠኛ ነዎት ይህንን ምድብ መሰረዝ ይፈልጋሉ?",
    csvEmpty: "በCSV ፋይል ውስጥ ምንም ትክክለኛ መረጃ አልተገኘም!",
    csvSuccess: " ምድቦች በጥሩ ሁኔታ ገብተዋል!",
    csvError: "በማስገባት ሂደት ላይ ስህተት ተፈጥሯል!"
  },
  om: {
    buildingTitle: "Ramaddii Meeshaalee Ijaarsaa",
    pharmacyTitle: "Ramaddii Faarmaasii",
    searchPlaceholder: "Barbaadi...",
    addCategory: "+ Dabali",
    import: "📥 Galchuu",
    export: "📤 Baasuu",
    thCategoryId: "ID",
    thName: "MAQAA",
    thProducts: "OOMISHAALEE",
    thActions: "TARKANFIISSA",
    edit: "Gulaali",
    delete: "Haqi",
    noCategories: "Ramaddiin tokkoollee hin argamne.",
    editTitle: "Ramaddii Gulaali",
    addTitle: "Ramaddii Dabali",
    categoryIdLabel: "Eeyyama Ramaddii (Filannoo)",
    categoryNameLabel: "Maqaa Ramaddii",
    buildingPlaceholder: "Simbirroo, Sibila",
    pharmacyPlaceholder: "Qoricha, Sirooppii",
    cancel: "Dhiisi",
    update: "Haaromsi",
    save: "Olka'i",
    confirmDelete: "Ramaddii kana haquuf mirkanaa'aadhaa?",
    csvEmpty: "Faayila CSV keessatti daataan sirrii hin argamne!",
    csvSuccess: " Ramaddiileen milkaa'inaan galaniiru!",
    csvError: "Dogoggorri uumameera faayila galchuu irratti!"
  },
  en: {
    buildingTitle: "Building Categories",
    pharmacyTitle: "Pharmacy Categories",
    searchPlaceholder: "Search...",
    addCategory: "+ Add",
    import: "Import",
    export: "Export",
    thCategoryId: "ID",
    thName: "NAME",
    thProducts: "PRODUCTS",
    thActions: "ACTIONS",
    edit: "Edit",
    delete: "Delete",
    noCategories: "No categories found.",
    editTitle: "Edit Category",
    addTitle: "Add Category",
    categoryIdLabel: "Category ID (Optional)",
    categoryNameLabel: "Category Name",
    buildingPlaceholder: "e.g. Cement, Steel",
    pharmacyPlaceholder: "e.g. Syrup, Tablet",
    cancel: "Cancel",
    update: "Update",
    save: "Save",
    confirmDelete: "Are you sure you want to delete this category?",
    csvEmpty: "CSV data is empty or invalid!",
    csvSuccess: " categories imported successfully!",
    csvError: "Error during import process!"
  }
};

function Categories() {
  const [lang, setLang] = useState(() => localStorage.getItem('appLanguage') || 'am');
  const t = translations[lang] || translations.am;

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    categoryId: '',
    name: ''
  });

  const rawType = localStorage.getItem('businessType') || 'pharmacy';
  const isBuildingMode = rawType.toLowerCase().includes('building');
  const currentBusinessType = isBuildingMode ? 'building_materials' : 'pharmacy';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    };
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/categories?businessType=${currentBusinessType}`,
        getAuthHeaders()
      );

      if (res.data) {
        const filtered = res.data.filter(cat => {
          const catType = (cat.businessType || '').toLowerCase();
          if (isBuildingMode) {
            return catType.includes('building') || catType === 'building_materials';
          }
          return catType.includes('pharmacy') || catType === '' || !cat.businessType;
        });

        setCategories(filtered);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();

    const handleModeChange = () => fetchCategories();
    const handleLangChange = () => {
      const savedLang = localStorage.getItem('appLanguage') || 'am';
      setLang(savedLang);
    };

    window.addEventListener('storage', handleModeChange);
    window.addEventListener('businessTypeChanged', handleModeChange);
    window.addEventListener('storage', handleLangChange);
    window.addEventListener('languageChanged', handleLangChange);

    return () => {
      window.removeEventListener('storage', handleModeChange);
      window.removeEventListener('businessTypeChanged', handleModeChange);
      window.removeEventListener('storage', handleLangChange);
      window.removeEventListener('languageChanged', handleLangChange);
    };
  }, []);

  const handleEditClick = (cat) => {
    setEditingId(cat._id);
    setFormData({
      categoryId: cat.categoryId || '',
      name: cat.name || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ categoryId: '', name: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm(t.confirmDelete)) {
      try {
        await axios.delete(`${API_BASE_URL}/categories/${id}`, getAuthHeaders());
        fetchCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = getAuthHeaders();
      const payload = {
        ...formData,
        businessType: currentBusinessType
      };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/categories/${editingId}`, payload, config);
      } else {
        await axios.post(`${API_BASE_URL}/categories`, payload, config);
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const formattedCategories = results.data.map((item) => ({
            name: item.name || item.CategoryName || item.Name || item['የምድብ ስም'],
            categoryId: item.categoryId || item.CategoryId || Math.floor(1000 + Math.random() * 9000).toString(),
            productsCount: Number(item.productsCount || item.ProductsCount) || 0,
            businessType: currentBusinessType
          })).filter(c => c.name && c.name.trim() !== '');

          if (formattedCategories.length === 0) {
            alert(t.csvEmpty);
            return;
          }

          await axios.post(`${API_BASE_URL}/categories/bulk`, formattedCategories, getAuthHeaders());
          alert(`${formattedCategories.length}${t.csvSuccess}`);
          fetchCategories();
        } catch (err) {
          console.error('CSV Import Error:', err);
          alert(t.csvError);
        }
      }
    });

    e.target.value = '';
  };

  const handleCSVExport = () => {
    if (categories.length === 0) {
      alert('ምንም የሚወጣ ምድብ የለም!');
      return;
    }

    const dataToExport = categories.map(cat => ({
      name: cat.name || '',
      categoryId: cat.categoryId || '',
      productsCount: cat.productsCount || 0
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentBusinessType}_categories.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCategories = categories.filter((cat) =>
    (cat.name && cat.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cat.categoryId && cat.categoryId.toString().includes(searchTerm))
  );

  return (
    <div style={{ padding: '12px', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f6f8', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      <style>{`
        .cat-top-bar {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 10px;
        }
        .cat-title {
          font-size: 16px;
          font-weight: 600;
          color: '#333';
          margin: 0;
        }
        .cat-controls {
          display: flex;
          gap: 6px;
          align-items: center;
          width: 100%;
        }
        .cat-search-input {
          flex: 1;
          min-width: 0;
          padding: 6px 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 12px;
          background-color: #fff;
          box-sizing: border-box;
        }
        .cat-action-btn {
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          border: none;
        }
        .table-wrapper {
          flex: 1;
          background-color: #fff;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          overflow: auto;
        }
        .modal-card-cat {
          width: 95%;
          max-width: 360px;
        }
        @media (min-width: 600px) {
          .cat-top-bar {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          .cat-controls {
            width: auto;
          }
          .cat-search-input {
            width: 150px;
            flex: none;
          }
        }
      `}</style>

      {/* Control Panel Header */}
      <div className="cat-top-bar">
        <h2 className="cat-title">
          {isBuildingMode ? t.buildingTitle : t.pharmacyTitle}
        </h2>
        
        <div className="cat-controls">
          <input
            type="text"
            className="cat-search-input"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button
            className="cat-action-btn"
            onClick={() => { setEditingId(null); setShowModal(true); }}
            style={{ backgroundColor: '#0d6efd', color: '#fff' }}
          >
            {t.addCategory}
          </button>

          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleCSVImport}
            style={{ display: 'none' }}
          />

          <button
            className="cat-action-btn"
            onClick={() => fileInputRef.current.click()}
            style={{ backgroundColor: '#fff', color: '#333', border: '1px solid #ccc' }}
          >
            {t.import}
          </button>

          <button
            className="cat-action-btn"
            onClick={handleCSVExport}
            style={{ backgroundColor: '#198754', color: '#fff' }}
          >
            {t.export}
          </button>
        </div>
      </div>

      {/* Main Table Content - Full Screen Viewport Fit */}
      <div className="table-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e0e0e0', color: '#666', fontSize: '11px', letterSpacing: '0.5px', position: 'sticky', top: 0, zIndex: 1 }}>
              <th style={{ padding: '8px 10px', fontWeight: '600' }}>{t.thCategoryId}</th>
              <th style={{ padding: '8px 10px', fontWeight: '600' }}>{t.thName}</th>
              <th style={{ padding: '8px 10px', fontWeight: '600' }}>{t.thProducts}</th>
              <th style={{ padding: '8px 10px', fontWeight: '600', textAlign: 'right' }}>{t.thActions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888', fontSize: '12px' }}>
                  {t.noCategories}
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 10px', color: '#555', fontFamily: 'monospace' }}>{cat.categoryId}</td>
                  <td style={{ padding: '8px 10px', fontWeight: '500', color: '#222' }}>{cat.name}</td>
                  <td style={{ padding: '8px 10px', color: '#555' }}>{cat.productsCount || 0}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => handleEditClick(cat)}
                      style={{
                        background: 'transparent',
                        color: '#0d6efd',
                        border: 'none',
                        marginRight: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {t.edit}
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      style={{
                        background: 'transparent',
                        color: '#dc3545',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {t.delete}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Responsive Form Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '10px' }}>
          <div className="modal-card-cat" style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', boxSizing: 'border-box' }}>
            <h3 style={{ marginTop: 0, marginBottom: '14px', fontSize: '14px', color: '#333', fontWeight: '600' }}>
              {editingId ? t.editTitle : t.addTitle}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#666', marginBottom: '3px', display: 'block' }}>{t.categoryIdLabel}</label>
                <input
                  type="text"
                  placeholder="e.g. 2813"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#666', marginBottom: '3px', display: 'block' }}>{t.categoryNameLabel}</label>
                <input
                  type="text"
                  required
                  placeholder={isBuildingMode ? t.buildingPlaceholder : t.pharmacyPlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" onClick={handleCloseModal} style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                  {t.cancel}
                </button>
                <button type="submit" style={{ backgroundColor: '#0d6efd', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                  {editingId ? t.update : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;