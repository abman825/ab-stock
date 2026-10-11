import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

const translations = {
  am: {
    buildingTitle: "የግንባታ መሣሪያዎች ምደባ",
    pharmacyTitle: "የፋርማሲ ምደባ",
    searchPlaceholder: "ይፈልጉ...",
    addCategory: "+ ምድብ ጨምር",
    import: "📥 አስገባ (Import)",
    export: "ምርቶችን አውጣ (Export)",
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
    buildingPlaceholder: "ምሳሌ፦ ሲሚንቶ፣ ብረት",
    pharmacyPlaceholder: "ምሳሌ፦ መደኃኒት፣ ሲሮፕ",
    cancel: "ሰርዝ",
    update: "አዲስ",
    save: "አስቀምጥ",
    confirmDelete: "እርግጠኛ ኖት ይህንን ምድብ መሠረዝ ይፈልጋሉ?",
    csvEmpty: "በCSV ፋይል ውስጥ ምንም ትክክለኛ መረጃ አልተገኘም!",
    csvSuccess: " ምድቦች በጥሩ ሁኔታ ገብተዋል!",
    csvError: "በማስገባት ሂደት ላይ ስህተት ተፈጥሯል!"
  },
  om: {
    buildingTitle: "Ramaddii Meeshaalee Ijaarsaa",
    pharmacyTitle: "Ramaddii Faarmaasii",
    searchPlaceholder: "Barbaadi...",
    addCategory: "+ Ramaddii Dabali",
    import: "📥 Galchuu (Import)",
    export: "Ramaddii Baasi (Export)",
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
    addCategory: "+ Add Category",
    import: "Import",
    export: "Export Categories",
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
        // ${editingId} የሚለውን እናወጣዋለን ምክንያቱም አዲስ ስንመዘገብ ID አይኖረውም (ወደ /api/categories ብቻ ነው መላክ ያለብን)
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
      alert(lang === 'am' ? 'ለማውጣት ምንም ምድብ የለም!' : lang === 'om' ? 'Oomishni ergame hin jiru!' : 'No categories to export!');
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
    <div style={{ padding: '15px', flex: 1, backgroundColor: '#f8f9fa', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      <style>{`
        .cat-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .header-actions {
          display: flex;
          gap: 10px;
        }
        .filter-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .cat-search-input {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          width: 250px;
          box-sizing: border-box;
          font-size: 13px;
        }
        .table-wrapper {
          background: #fff;
          border-radius: 8px;
          border: 1px solid #dee2e6;
          overflow-x: auto;
          width: 100%;
        }
        .categories-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 12px;
        }
      `}</style>

      {/* Header Bar - Exactly matching Product page structure */}
      <div className="cat-top-bar">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            {isBuildingMode ? t.buildingTitle : t.pharmacyTitle}
          </h2>
        </div>
        
        <div className="header-actions">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleCSVImport}
            style={{ display: 'none' }}
          />

          <label 
            onClick={() => fileInputRef.current.click()}
            style={{ 
              background: '#6c757d', 
              color: '#fff', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '13px'
            }}
          >
            {t.import}
          </label>

          <button
            onClick={() => { setEditingId(null); setShowModal(true); }}
            style={{ background: '#0d6efd', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
          >
            {t.addCategory}
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="filter-container">
        <input
          type="text"
          className="cat-search-input"
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Section */}
      <div className="table-wrapper">
        <table className="categories-table">
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6', color: '#6c757d' }}>
              <th style={{ padding: '10px' }}>{t.thCategoryId}</th>
              <th style={{ padding: '10px' }}>{t.thName}</th>
              <th style={{ padding: '10px' }}>{t.thProducts}</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>{t.thActions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                  {t.noCategories}
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat._id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                  <td style={{ padding: '8px 10px', color: '#6c757d', fontFamily: 'monospace' }}>{cat.categoryId}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 'bold' }}>{cat.name}</td>
                  <td style={{ padding: '8px 10px' }}>{cat.productsCount || 0}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleEditClick(cat)}
                      style={{ background: '#ffc107', color: '#000', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '5px' }}
                    >
                      {t.edit}
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
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

      {/* Large Export Button at Bottom - Exactly like Product page */}
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <button
          onClick={handleCSVExport}
          style={{ background: '#0d6efd', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {t.export}
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '10px' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '100%', maxWidth: '360px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '14px', fontSize: '16px', color: '#333', fontWeight: 'bold' }}>
              {editingId ? t.editTitle : t.addTitle}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>{t.categoryIdLabel}</label>
                <input
                  type="text"
                  placeholder="e.g. 2813"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>{t.categoryNameLabel}</label>
                <input
                  type="text"
                  required
                  placeholder={isBuildingMode ? t.buildingPlaceholder : t.pharmacyPlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={handleCloseModal} style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                  {t.cancel}
                </button>
                <button type="submit" style={{ backgroundColor: '#0d6efd', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
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