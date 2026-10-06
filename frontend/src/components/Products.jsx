import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductModal from './ProductModal';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

const translations = {
  am: {
    title: "የምርቶች አስተዳደር",
    buildingMode: "🏗️ የሕንፃ መሣሪያዎች ሁኔታ",
    pharmacyMode: "💊 የፋርማሲ ሁኔታ",
    import: "📥 አስገባ (Import)",
    addProduct: "+ ምርት ጨምር",
    searchPlaceholder: "ፈልግ...",
    all: "ሁሉም",
    inStock: "ስቶክ ላይ ያለ",
    lowStock: "አነስተኛ ስቶክ",
    outOfStock: "ያለቀ",
    thName: "ስም",
    thCategory: "ምድብ",
    thProdType: "የምርት ዓይነት",
    thMaterialType: "የዕቃ ዓይነት (Specific Type)",
    thUnit: "ዩኒት (Unit)",
    thSpecificType: "የዕቃ ዓይነት",
    thSalePrice: "የመሸጫ ዋጋ",
    thBoughtPrice: "የመግዣ ዋጋ",
    thInStore: "መጋዘን ውስጥ",
    thInShop: "ሱቅ ውስጥ",
    thInvoice: "ኢንቮይስ #",
    thExpiry: "የማብቂያ ቀን",
    thActions: "ድርጊቶች",
    edit: "አስተካክል",
    delete: "ሰርዝ",
    export: "ምርቶችን አውጣ (Export)",
    noProducts: "ምንም ምርት አልተገኘም።",
    confirmDelete: "እርግጠኛ ነዎት ይህንን ምርት መሰረዝ ይፈልጋሉ?",
    deleteSuccess: "ምርቱ በጥሩ ሁኔታ ተሰርዟል!",
    deleteFailed: "ምርቱን መሰረዝ አልተሳካም።",
    csvImportSuccess: "የCSV ፋይል በጥሩ ሁኔታ ገብቷል!",
    csvImportNoData: "በCSV ፋይሉ ውስጥ ምንም ትክክለኛ መረጃ አልተገኘም!",
    csvImportFailed: "የCSV ፋይል ማስገባት አልተሳካም: ",
    noExportData: "ለመላክ ምንም ምርት የለም!",
    enterNameErr: "እባክዎን የምርት ስም ያስገቡ!",
    selectCatErr: "እባክዎን ምድብ ይምረጡ!",
    validPriceErr: "እባክዎን ትክክለኛ የመግዣ ዋጋ ያስገቡ!",
    updateSuccess: "ምርቱ በጥሩ ሁኔታ ተስተካክሏል!",
    saveSuccess: "ምርቱ በጥሩ ሁኔታ ተመዝግቧል!",
    saveFailed: "ምርቱን መመዝገብ አልተሳካም: ",
    birr: "ብር",
    na: "የለም"
  },
  om: {
    title: "Bulchiinsa Oomishootaa",
    buildingMode: "🏗️ Haala Meeshaalee Ijaarsaa",
    pharmacyMode: "💊 Haala Faarmaasii",
    import: "📥 Galchuu (Import)",
    addProduct: "+ Oomisha Dabali",
    searchPlaceholder: "Barbaadi...",
    all: "Hundumaa",
    inStock: "Stookii Keessa Kan Jiru",
    lowStock: "Stookii Xiqqaa",
    outOfStock: "Kan Dhumate",
    thName: "MAQAA",
    thCategory: "RAMADDII",
    thProdType: "GOSA OOMISHAA",
    thMaterialType: "GOSA MEESHAA",
    thUnit: "YUUNIITII",
    thSpecificType: "GOSA WAA'EE",
    thSalePrice: "GURGURTAA",
    thBoughtPrice: "BITAA",
    thInStore: "GUTTUMMAAN",
    thInShop: "SUUQA KEESSA",
    thInvoice: "INVOICE #",
    thExpiry: "GUYYAA SAAMUDAA",
    thActions: "TARKANFIISSA",
    edit: "Gulaali",
    delete: "Haqi",
    export: "Oomisha Baasi (Export)",
    noProducts: "Oomishni hin argamne.",
    confirmDelete: "Oomisha kana haquuf mirkanaa'aadhaa?",
    deleteSuccess: "Oomishni milkaa'inaan haqameera!",
    deleteFailed: "Oomisha haquun kuffa'eera!",
    csvImportSuccess: "Faayilli CSV milkaa'inaan galee jira!",
    csvImportNoData: "Faayila CSV keessatti daataan sirrii hin argamne!",
    csvImportFailed: "Faayila CSV galchuun kuffa'eera: ",
    noExportData: "Oomishni ergame hin jiru!",
    enterNameErr: "Maaloo maqaa oomishaa galchaa!",
    selectCatErr: "Maaloo ramaddii filadhaa!",
    validPriceErr: "Maaloo gatii bitaa sirrii galchaa!",
    updateSuccess: "Oomishni milkaa'inaan haara'omeera!",
    saveSuccess: "Oomishni milkaa'inaan olka'ameera!",
    saveFailed: "Oomisha olka'uun kuffa'eera: ",
    birr: "Birr",
    na: "Hingarre"
  },
  en: {
    title: "Product Management",
    buildingMode: "🏗️ Building Materials Mode",
    pharmacyMode: "💊 Pharmacy Mode",
    import: "📥 Import",
    addProduct: "+ Add product",
    searchPlaceholder: "Search...",
    all: "All",
    inStock: "In stock",
    lowStock: "Low stock",
    outOfStock: "Out of stock",
    thName: "NAME",
    thCategory: "CATEGORY",
    thProdType: "PROD TYPE",
    thMaterialType: "SPECIFIC TYPE",
    thUnit: "UNIT",
    thSpecificType: "SPECIFIC TYPE",
    thSalePrice: "SALE PRICE",
    thBoughtPrice: "BOUGHT PRICE",
    thInStore: "IN STORE",
    thInShop: "IN SHOP",
    thInvoice: "INVOICE #",
    thExpiry: "EXPIRY DATE",
    thActions: "ACTIONS",
    edit: "Edit",
    delete: "Delete",
    export: "Export Products",
    noProducts: "No products found.",
    confirmDelete: "Are you sure you want to delete this product?",
    deleteSuccess: "Product deleted successfully!",
    deleteFailed: "Failed to delete product!",
    csvImportSuccess: "CSV file imported successfully!",
    csvImportNoData: "No valid data found in CSV file!",
    csvImportFailed: "CSV import failed: ",
    noExportData: "No products available to export!",
    enterNameErr: "Please enter product name!",
    selectCatErr: "Please select a category!",
    validPriceErr: "Please enter a valid bought price!",
    updateSuccess: "Product updated successfully!",
    saveSuccess: "Product saved successfully!",
    saveFailed: "Failed to save product: ",
    birr: "Birr",
    na: "N/A"
  }
};

function Products() {
  const [lang, setLang] = useState(() => localStorage.getItem('appLanguage') || 'am');
  const t = translations[lang] || translations.am;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [businessType, setBusinessType] = useState(
    localStorage.getItem('businessType') || 'pharmacy'
  );

  const isBuilding = businessType === 'building' || businessType === 'building_materials' || businessType === 'buildingMaterials';
  const currentBusinessType = isBuilding ? 'building_materials' : 'pharmacy';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    boughtPrice: '',
    price: '',
    productType: 'Stock',
    stockThreshold: '',
    specificType: '',
    unit: '',
    isSyrup: false,
    inStoreQty: 0,
    quantity: 0,
    invoiceNo: '',
    expiryDate: ''
  });

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
    window.addEventListener('storage', handleModeChange);
    window.addEventListener('languageChanged', handleLangChange);
    window.addEventListener('storage', handleLangChange);

    return () => {
      window.removeEventListener('businessTypeChanged', handleModeChange);
      window.removeEventListener('storage', handleModeChange);
      window.removeEventListener('languageChanged', handleLangChange);
      window.removeEventListener('storage', handleLangChange);
    };
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: getAuthHeaders() };
      
      const [resProducts, resCategories] = await Promise.all([
        axios.get(`${API_BASE_URL}/products?businessType=${currentBusinessType}`, config),
        axios.get(`${API_BASE_URL}/categories?businessType=${currentBusinessType}`, config)
      ]);

      setProducts(resProducts.data);

      const filteredCategories = resCategories.data.filter((cat) => {
        const catType = (cat.businessType || '').toLowerCase();
        if (isBuilding) {
          return catType === 'building_materials' || catType.includes('building');
        }
        return catType === 'pharmacy' || catType === '' || !cat.businessType;
      });

      setCategories(filteredCategories);

      if (filteredCategories.length > 0) {
        setFormData((prev) => ({
          ...prev,
          category: prev.category || filteredCategories[0].name
        }));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [businessType]);

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r\n|\n/);
        const importedProducts = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || line.split(',');
          const cleanValues = values.map((val) => val.replace(/^"|"$/g, '').trim());

          if (cleanValues.length >= 2) {
            const expDate = cleanValues[8] ? new Date(cleanValues[8]) : null;
            const validExpiryDate = expDate && !isNaN(expDate.getTime()) ? expDate.toISOString() : null;

            importedProducts.push({
              name: cleanValues[0] || 'Imported Product',
              category: cleanValues[1] || (categories.length > 0 ? categories[0].name : 'General'),
              productType: cleanValues[2] || 'Stock',
              boughtPrice: Number(cleanValues[3]) || 0,
              price: Number(cleanValues[4]) || 0,
              inStoreQty: Number(cleanValues[5]) || 0,
              quantity: Number(cleanValues[6]) || 0,
              invoiceNo: cleanValues[7] || `INV-IMP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
              expiryDate: validExpiryDate,
              stockThreshold: Number(cleanValues[9]) || 0,
              specificType: cleanValues[10] || '',
              unit: cleanValues[11] || '',
              isSyrup: cleanValues[12] === 'true' || cleanValues[12] === 'Yes',
              businessType: currentBusinessType
            });
          }
        }

        if (importedProducts.length > 0) {
          await axios.post(`${API_BASE_URL}/products/bulk`, importedProducts, {
            headers: getAuthHeaders()
          });
          alert(t.csvImportSuccess);
          fetchData();
        } else {
          alert(t.csvImportNoData);
        }
      } catch (err) {
        console.error('Error importing CSV:', err.response ? err.response.data : err.message);
        alert(`${t.csvImportFailed}${err.response?.data?.message || 'Server Error'}`);
      }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    
    let formattedExpDate = '';
    if (product.expiryDate || product.expirationDate) {
      formattedExpDate = new Date(product.expiryDate || product.expirationDate).toISOString().split('T')[0];
    }

    setFormData({
      name: product.name || '',
      category: product.category || (categories.length > 0 ? categories[0].name : 'General'),
      productType: product.productType || 'Stock',
      boughtPrice: product.boughtPrice !== undefined ? product.boughtPrice : '',
      price: product.price || product.salePrice || '',
      stockThreshold: product.stockThreshold !== undefined ? product.stockThreshold : '',
      specificType: product.specificType || product.type || '',
      unit: product.unit || '',
      isSyrup: product.isSyrup || false,
      inStoreQty: product.inStoreQty || product.inStore || 0,
      quantity: product.quantity || product.inShop || 0,
      invoiceNo: product.invoiceNo || '',
      expiryDate: formattedExpDate
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: '',
      category: categories.length > 0 ? categories[0].name : 'General',
      productType: 'Stock',
      boughtPrice: '',
      price: '',
      stockThreshold: '',
      specificType: '',
      unit: '',
      isSyrup: false,
      inStoreQty: 0,
      quantity: 0,
      invoiceNo: '',
      expiryDate: ''
    });
  };

  const filteredProducts = products.filter((p) => {
    const qty = p.quantity ?? p.inShop ?? 0;
    const matchesSearch = p.name ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    if (!matchesSearch) return false;

    if (filter === 'In stock') return qty > 0;
    if (filter === 'Low stock') return qty > 0 && qty < (p.stockThreshold || 5);
    if (filter === 'Out of stock') return qty <= 0;

    return true;
  });

  const handleDelete = async (id) => {
    if (window.confirm(t.confirmDelete)) {
      try {
        await axios.delete(`${API_BASE_URL}/products/${id}`, {
          headers: getAuthHeaders()
        });
        alert(t.deleteSuccess);
        fetchData();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert(t.deleteFailed);
      }
    }
  };

  const handleExport = () => {
    if (!filteredProducts || filteredProducts.length === 0) {
      alert(t.noExportData);
      return;
    }

    const headers = isBuilding
      ? ["Name", "Category", "Product Type", "Specific Type", "Unit", "Bought Price", "Sale Price", "Stock Threshold", "In Store", "In Shop", "Invoice #"]
      : ["Name", "Category", "Product Type", "Specific Type", "Is Syrup", "Bought Price", "Sale Price", "Stock Threshold", "In Store", "In Shop", "Invoice #", "Expiry Date"];
    
    const csvRows = [
      headers.join(','),
      ...filteredProducts.map((p) => {
        const exp = p.expiryDate || p.expirationDate ? new Date(p.expiryDate || p.expirationDate).toLocaleDateString() : 'N/A';
        
        if (isBuilding) {
          return [
            `"${p.name || ''}"`,
            `"${p.category || ''}"`,
            `"${p.productType || 'Stock'}"`,
            `"${p.specificType || p.type || ''}"`,
            `"${p.unit || ''}"`,
            p.boughtPrice || 0,
            p.price || p.salePrice || 0,
            p.stockThreshold || 0,
            p.inStoreQty || p.inStore || 0,
            p.quantity || p.inShop || 0,
            `"${p.invoiceNo || ''}"`
          ].join(',');
        } else {
          return [
            `"${p.name || ''}"`,
            `"${p.category || ''}"`,
            `"${p.productType || 'Stock'}"`,
            `"${p.specificType || p.type || ''}"`,
            p.isSyrup ? 'Yes' : 'No',
            p.boughtPrice || 0,
            p.price || p.salePrice || 0,
            p.stockThreshold || 0,
            p.inStoreQty || p.inStore || 0,
            p.quantity || p.inShop || 0,
            `"${p.invoiceNo || ''}"`,
            `"${exp}"`
          ].join(',');
        }
      })
    ];

    const csvString = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || formData.name.trim() === '') {
      alert(t.enterNameErr);
      return;
    }

    if (!formData.category || formData.category.trim() === '') {
      alert(t.selectCatErr);
      return;
    }

    if (formData.boughtPrice === '' || Number(formData.boughtPrice) < 0) {
      alert(t.validPriceErr);
      return;
    }

    try {
      const parsedThreshold = formData.stockThreshold !== '' && formData.stockThreshold !== null 
        ? Number(formData.stockThreshold) 
        : 0;

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        productType: formData.productType,
        specificType: formData.specificType || '',
        unit: formData.unit || '',
        isSyrup: Boolean(formData.isSyrup),
        boughtPrice: Number(formData.boughtPrice),
        price: Number(formData.price),
        stockThreshold: isNaN(parsedThreshold) ? 0 : parsedThreshold,
        inStoreQty: Number(formData.inStoreQty) || 0,
        quantity: Number(formData.quantity) || 0,
        invoiceNo: formData.invoiceNo || `INV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        businessType: currentBusinessType
      };

      if (formData.expiryDate && formData.expiryDate.trim() !== '') {
        payload.expiryDate = new Date(formData.expiryDate).toISOString();
      }

      const config = { headers: getAuthHeaders() };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/products/${editingId}`, payload, config);
        alert(t.updateSuccess);
      } else {
        await axios.post(`${API_BASE_URL}/products`, payload, config);
        alert(t.saveSuccess);
      }

      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Error saving product:', err.response ? err.response.data : err.message);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data);
      alert(`${t.saveFailed}${serverMsg || 'Server Error'}`);
    }
  };

  const filterTabLabels = {
    'All': t.all,
    'In stock': t.inStock,
    'Low stock': t.lowStock,
    'Out of stock': t.outOfStock
  };

  return (
    <div style={{ padding: '15px', flex: 1, background: '#f8f9fa', boxSizing: 'border-box', width: '100%' }}>
      
      <style>{`
        .products-header {
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
          flex-wrap: wrap;
          gap: 12px;
        }
        .search-input {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          width: 250px;
          box-sizing: border-box;
        }
        .filter-buttons {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }
        .table-container {
          background: #fff;
          border-radius: 8px;
          border: 1px solid #dee2e6;
          overflow-x: auto;
          width: 100%;
        }
        .products-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 12px;
          min-width: 850px;
        }

        @media (max-width: 600px) {
          .products-header {
            flex-direction: column;
            align-items: stretch;
          }
          .header-actions {
            width: 100%;
          }
          .header-actions label, .header-actions button {
            flex: 1;
            justify-content: center;
            text-align: center;
          }
          .filter-container {
            flex-direction: column;
            align-items: stretch;
          }
          .search-input {
            width: 100%;
          }
          .filter-buttons {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>

      {/* Top Header */}
      <div className="products-header">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{t.title}</h2>
          <span style={{ fontSize: '11px', color: '#0d6efd', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {isBuilding ? t.buildingMode : t.pharmacyMode}
          </span>
        </div>
        
        <div className="header-actions">
          <label style={{ 
            background: '#6c757d', 
            color: '#fff', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            {t.import}
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImportCSV} 
              style={{ display: 'none' }} 
            />
          </label>

          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: '',
                category: categories.length > 0 ? categories[0].name : 'General',
                productType: 'Stock',
                boughtPrice: '',
                price: '',
                stockThreshold: '',
                specificType: '',
                unit: '',
                isSyrup: false,
                inStoreQty: 0,
                quantity: 0,
                invoiceNo: '',
                expiryDate: ''
              });
              setShowModal(true);
            }}
            style={{ background: '#0d6efd', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {t.addProduct}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filter-container">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filter-buttons">
          {['All', 'In stock', 'Low stock', 'Out of stock'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '15px',
                fontSize: '12px',
                cursor: 'pointer',
                background: filter === f ? '#0d6efd' : '#e9ecef',
                color: filter === f ? '#fff' : '#212529'
              }}
            >
              {filterTabLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6', color: '#6c757d' }}>
              <th style={{ padding: '10px' }}>{t.thName}</th>
              <th style={{ padding: '10px' }}>{t.thCategory}</th>
              <th style={{ padding: '10px' }}>{t.thProdType}</th>
              
              {isBuilding ? (
                <>
                  <th style={{ padding: '10px' }}>{t.thMaterialType}</th>
                  <th style={{ padding: '10px' }}>{t.thUnit}</th>
                </>
              ) : (
                <th style={{ padding: '10px' }}>{t.thSpecificType}</th>
              )}

              <th style={{ padding: '10px' }}>{t.thSalePrice}</th>
              <th style={{ padding: '10px' }}>{t.thBoughtPrice}</th>
              <th style={{ padding: '10px' }}>{t.thInStore}</th>
              <th style={{ padding: '10px' }}>{t.thInShop}</th>
              <th style={{ padding: '10px' }}>{t.thInvoice}</th>
              {!isBuilding && <th style={{ padding: '10px' }}>{t.thExpiry}</th>}
              <th style={{ padding: '10px' }}>{t.thActions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={isBuilding ? "11" : "10"} style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                  {t.noProducts}
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const exp = p.expiryDate || p.expirationDate;
                const qty = p.quantity ?? p.inShop ?? 0;
                return (
                  <tr key={p._id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 'bold' }}>{p.name}</td>
                    <td style={{ padding: '8px 10px' }}>{p.category}</td>
                    <td style={{ padding: '8px 10px' }}>{p.productType || 'Stock'}</td>
                    
                    {isBuilding ? (
                      <>
                        <td style={{ padding: '8px 10px', color: '#0d6efd', fontWeight: '500' }}>
                          {p.specificType || t.na}
                        </td>
                        <td style={{ padding: '8px 10px', fontWeight: 'bold' }}>
                          {p.unit || '-'}
                        </td>
                      </>
                    ) : (
                      <td style={{ padding: '8px 10px' }}>{p.specificType || t.na}</td>
                    )}

                    <td style={{ padding: '8px 10px' }}>{p.price} {t.birr}</td>
                    <td style={{ padding: '8px 10px', color: '#28a745', fontWeight: 'bold' }}>{p.boughtPrice ? `${p.boughtPrice} ${t.birr}` : `0 ${t.birr}`}</td>
                    <td style={{ padding: '8px 10px' }}>{p.inStoreQty ?? 0}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{ background: qty < (p.stockThreshold || 5) ? '#f8d7da' : '#d1e7dd', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                        {qty}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', color: '#6c757d' }}>{p.invoiceNo || t.na}</td>
                    
                    {!isBuilding && (
                      <td style={{ padding: '8px 10px', color: exp ? '#fd7e14' : '#6c757d', fontWeight: exp ? 'bold' : 'normal' }}>
                        {exp ? new Date(exp).toLocaleDateString() : t.na}
                      </td>
                    )}

                    <td style={{ padding: '8px 10px', display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => handleEditClick(p)}
                        style={{ background: '#ffc107', color: '#000', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        {t.edit}
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        {t.delete}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Export Button */}
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <button
          onClick={handleExport}
          style={{ background: '#0d6efd', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {t.export}
        </button>
      </div>

      {/* Modal */}
      <ProductModal
        showModal={showModal}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        businessType={currentBusinessType}
        handleCloseModal={handleCloseModal}
        handleSubmit={handleSubmit}
      />

    </div>
  );
}

export default Products;