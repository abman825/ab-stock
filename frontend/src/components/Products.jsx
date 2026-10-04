import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductModal from './ProductModal';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 1. businessType አስቀድሞ መታወቅ አለበት
  const [businessType, setBusinessType] = useState(
    localStorage.getItem('businessType') || 'pharmacy'
  );

  // 2. isBuilding ከ businessType በኋላ መምጣት አለበት
  const isBuilding = businessType === 'building' || businessType === 'building_materials' || businessType === 'buildingMaterials';

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

    window.addEventListener('businessTypeChanged', handleModeChange);
    return () => window.removeEventListener('businessTypeChanged', handleModeChange);
  }, []);

  // 3. FIX: Fetch products based on current businessType
  const fetchData = async () => {
    try {
      const config = { headers: getAuthHeaders() };
      const [resProducts, resCategories] = await Promise.all([
        axios.get(`${API_BASE_URL}/products?businessType=${businessType}`, config),
        axios.get(`${API_BASE_URL}/categories`, config)
      ]);

      setProducts(resProducts.data);
      setCategories(resCategories.data);

      if (resCategories.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          category: prev.category || resCategories.data[0].name
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
              businessType: businessType
            });
          }
        }

        if (importedProducts.length > 0) {
          await axios.post(`${API_BASE_URL}/products/bulk`, importedProducts, {
            headers: getAuthHeaders()
          });
          alert('CSV file imported successfully!');
          fetchData();
        } else {
          alert('No valid data found in CSV file!');
        }
      } catch (err) {
        console.error('Error importing CSV:', err.response ? err.response.data : err.message);
        alert(`CSV import failed: ${err.response?.data?.message || 'Server Error'}`);
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

  // 4. FIX: Filter products smoothly without logic conflict
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
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_BASE_URL}/products/${id}`, {
          headers: getAuthHeaders()
        });
        alert('Product deleted successfully!');
        fetchData();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product!');
      }
    }
  };

  const handleExport = () => {
    if (!filteredProducts || filteredProducts.length === 0) {
      alert('No products available to export!');
      return;
    }

    const headers = isBuilding
      ? ["Name", "Category", "Product Type", "Material Type", "Unit", "Bought Price", "Sale Price", "Stock Threshold", "In Store", "In Shop", "Invoice #"]
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
      alert('Please enter product name!');
      return;
    }

    if (!formData.category || formData.category.trim() === '') {
      alert('Please select a category!');
      return;
    }

    if (formData.boughtPrice === '' || Number(formData.boughtPrice) < 0) {
      alert('Please enter a valid bought price!');
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
        businessType: businessType
      };

      if (formData.expiryDate && formData.expiryDate.trim() !== '') {
        payload.expiryDate = new Date(formData.expiryDate).toISOString();
      }

      const config = { headers: getAuthHeaders() };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/products/${editingId}`, payload, config);
        alert('Product updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/products`, payload, config);
        alert('Product saved successfully!');
      }

      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Error saving product:', err.response ? err.response.data : err.message);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data);
      alert(`Failed to save product: ${serverMsg || 'Server Error'}`);
    }
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
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Product Management</h2>
          <span style={{ fontSize: '11px', color: '#0d6efd', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {isBuilding ? '🏗️ Building Materials Mode' : '💊 Pharmacy Mode'}
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
            📥 Import
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
            + Add product
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filter-container">
        <input
          type="text"
          placeholder="Search..."
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
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6', color: '#6c757d' }}>
              <th style={{ padding: '10px' }}>NAME</th>
              <th style={{ padding: '10px' }}>CATEGORY</th>
              <th style={{ padding: '10px' }}>PROD TYPE</th>
              
              {isBuilding ? (
                <>
                  <th style={{ padding: '10px' }}>MATERIAL TYPE</th>
                  <th style={{ padding: '10px' }}>UNIT</th>
                </>
              ) : (
                <th style={{ padding: '10px' }}>SPECIFIC TYPE</th>
              )}

              <th style={{ padding: '10px' }}>SALE PRICE</th>
              <th style={{ padding: '10px' }}>BOUGHT PRICE</th>
              <th style={{ padding: '10px' }}>IN STORE</th>
              <th style={{ padding: '10px' }}>IN SHOP</th>
              <th style={{ padding: '10px' }}>INVOICE #</th>
              {!isBuilding && <th style={{ padding: '10px' }}>EXPIRY DATE</th>}
              <th style={{ padding: '10px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={isBuilding ? "11" : "10"} style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                  No products found.
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
                          {p.specificType || 'N/A'}
                        </td>
                        <td style={{ padding: '8px 10px', fontWeight: 'bold' }}>
                          {p.unit || '-'}
                        </td>
                      </>
                    ) : (
                      <td style={{ padding: '8px 10px' }}>{p.specificType || 'N/A'}</td>
                    )}

                    <td style={{ padding: '8px 10px' }}>{p.price} Birr</td>
                    <td style={{ padding: '8px 10px', color: '#28a745', fontWeight: 'bold' }}>{p.boughtPrice ? `${p.boughtPrice} Birr` : '0 Birr'}</td>
                    <td style={{ padding: '8px 10px' }}>{p.inStoreQty ?? 0}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{ background: qty < (p.stockThreshold || 5) ? '#f8d7da' : '#d1e7dd', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                        {qty}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', color: '#6c757d' }}>{p.invoiceNo || 'N/A'}</td>
                    
                    {!isBuilding && (
                      <td style={{ padding: '8px 10px', color: exp ? '#fd7e14' : '#6c757d', fontWeight: exp ? 'bold' : 'normal' }}>
                        {exp ? new Date(exp).toLocaleDateString() : 'N/A'}
                      </td>
                    )}

                    <td style={{ padding: '8px 10px', display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => handleEditClick(p)}
                        style={{ background: '#ffc107', color: '#000', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Delete
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
          Export Products
        </button>
      </div>

      {/* Modal */}
      <ProductModal
        showModal={showModal}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        businessType={businessType}
        handleCloseModal={handleCloseModal}
        handleSubmit={handleSubmit}
      />

    </div>
  );
}

export default Products;