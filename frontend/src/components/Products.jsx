import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Base API URL ማዘጋጃ
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Authorization Header
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // State for Editing
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    boughtPrice: '',
    price: '',
    productType: 'Stock',
    stockThreshold: '',
    specificType: '',
    isSyrup: false,
    inStoreQty: 0,
    quantity: 0,
    invoiceNo: '',
    expiryDate: ''
  });

  // Fetch Products & Categories
  const fetchData = async () => {
    try {
      const config = { headers: getAuthHeaders() };
      const [resProducts, resCategories] = await Promise.all([
        axios.get(`${API_URL}/api/products`, config),
        axios.get(`${API_URL}/api/categories`, config)
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
  }, []);

  // CSV Import Handler
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
              isSyrup: cleanValues[11] === 'true' || cleanValues[11] === 'Yes'
            });
          }
        }

        if (importedProducts.length > 0) {
          await axios.post(`${API_URL}/api/products/bulk`, importedProducts, {
            headers: getAuthHeaders()
          });
          alert('CSV በጅምላ ገብቷል!');
          fetchData();
        } else {
          alert('በ CSV ፋይሉ ውስጥ ትክክለኛ መረጃ አልተገኘም!');
        }
      } catch (err) {
        console.error('Error importing CSV:', err.response ? err.response.data : err.message);
        alert(`CSV በማስገባት ላይ ስህተት ተፈጽሟል: ${err.response?.data?.message || 'Server Error (500)'}`);
      }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  // Edit Click Handler
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
      price: product.price || '',
      stockThreshold: product.stockThreshold !== undefined ? product.stockThreshold : '',
      specificType: product.specificType || product.type || '',
      isSyrup: product.isSyrup || false,
      inStoreQty: product.inStoreQty || product.inStore || 0,
      quantity: product.quantity || product.inShop || 0,
      invoiceNo: product.invoiceNo || '',
      expiryDate: formattedExpDate
    });
    setShowModal(true);
  };

  // Modal Close & Reset
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
      isSyrup: false,
      inStoreQty: 0,
      quantity: 0,
      invoiceNo: '',
      expiryDate: ''
    });
  };

  // Filter Logic
  const filteredProducts = products.filter((p) => {
    const qty = p.quantity ?? p.inShop ?? 0;
    const matchesSearch = p.name ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    if (!matchesSearch) return false;

    if (filter === 'In stock') return qty > 0;
    if (filter === 'Low stock') return qty > 0 && qty < (p.stockThreshold || 5);
    if (filter === 'Out of stock') return qty <= 0;
    return true;
  });

  // Delete Product
  const handleDelete = async (id) => {
    if (window.confirm('ይህንን ምርት ለማጥፋት እርግጠኛ ነዎት?')) {
      try {
        await axios.delete(`${API_URL}/api/products/${id}`, {
          headers: getAuthHeaders()
        });
        alert('ምርቱ በትክክል ተሰርዟል!');
        fetchData();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('ምርቱን ማጥፋት አልተቻለም!');
      }
    }
  };

  // Export CSV
  const handleExport = () => {
    if (!filteredProducts || filteredProducts.length === 0) {
      alert('የሚወጣ (Export የሚደረግ) ምርት የለም!');
      return;
    }

    const headers = ["Name", "Category", "Product Type", "Specific Type", "Is Syrup", "Bought Price", "Sale Price", "Stock Threshold", "In Store", "In Shop", "Invoice #", "Expiry Date"];
    
    const csvRows = [
      headers.join(','),
      ...filteredProducts.map((p) => {
        const exp = p.expiryDate || p.expirationDate ? new Date(p.expiryDate || p.expirationDate).toLocaleDateString() : 'N/A';
        return [
          `"${p.name || ''}"`,
          `"${p.category || ''}"`,
          `"${p.productType || 'Stock'}"`,
          `"${p.specificType || p.type || ''}"`,
          p.isSyrup ? 'Yes' : 'No',
          p.boughtPrice || 0,
          p.price || 0,
          p.stockThreshold || 0,
          p.inStoreQty || p.inStore || 0,
          p.quantity || p.inShop || 0,
          `"${p.invoiceNo || ''}"`,
          `"${exp}"`
        ].join(',');
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

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category || formData.category.trim() === '') {
      alert('እባክዎን Category ይምረጡ!');
      return;
    }

    if (formData.boughtPrice === '' || Number(formData.boughtPrice) < 0) {
      alert('እባክዎን ትክክለኛ የገዢ ዋጋ (Bought Price) ያስገቡ!');
      return;
    }

    try {
      const parsedThreshold = formData.stockThreshold !== '' && formData.stockThreshold !== null 
        ? Number(formData.stockThreshold) 
        : 0;

      const payload = {
        name: formData.name,
        category: formData.category,
        productType: formData.productType,
        specificType: formData.specificType,
        type: formData.specificType,
        isSyrup: Boolean(formData.isSyrup),
        boughtPrice: Number(formData.boughtPrice),
        price: Number(formData.price),
        salePrice: Number(formData.price),
        stockThreshold: isNaN(parsedThreshold) ? 0 : parsedThreshold,
        inStoreQty: Number(formData.inStoreQty) || 0,
        inStore: Number(formData.inStoreQty) || 0,
        quantity: Number(formData.quantity) || 0,
        inShop: Number(formData.quantity) || 0,
        invoiceNo: formData.invoiceNo || `INV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      };

      if (formData.expiryDate && formData.expiryDate.trim() !== '') {
        payload.expiryDate = formData.expiryDate;
      }

      const config = { headers: getAuthHeaders() };

      if (editingId) {
        await axios.put(`${API_URL}/api/products/${editingId}`, payload, config);
        alert('የምርት መረጃው ተሻሽሏል!');
      } else {
        await axios.post(`${API_URL}/api/products`, payload, config);
        alert('አዲስ ምርት በበጥቃሉ ተመዝግቧል!');
      }

      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Error saving product:', err.response ? err.response.data : err.message);
      alert(`ምርቱን መመዝገብ አልተቻለም: ${err.response?.data?.message || err.response?.data?.error || 'Server Validation Error'}`);
    }
  };

  return (
    <div style={{ padding: '15px', flex: 1, background: '#f8f9fa', boxSizing: 'border-box', width: '100%' }}>
      
      {/* Responsive Styles Injection */}
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
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .modal-content {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          box-sizing: border-box;
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
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Top Header */}
      <div className="products-header">
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Product Management</h2>
        
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
              <th style={{ padding: '10px' }}>TYPE</th>
              <th style={{ padding: '10px' }}>SALE PRICE</th>
              <th style={{ padding: '10px' }}>BOUGHT PRICE</th>
              <th style={{ padding: '10px' }}>IN STORE</th>
              <th style={{ padding: '10px' }}>IN SHOP</th>
              <th style={{ padding: '10px' }}>INVOICE #</th>
              <th style={{ padding: '10px' }}>EXPIRY DATE</th>
              <th style={{ padding: '10px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
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
                    <td style={{ padding: '8px 10px' }}>{p.specificType || p.type || 'N/A'}</td>
                    <td style={{ padding: '8px 10px' }}>{p.price || p.salePrice} Birr</td>
                    <td style={{ padding: '8px 10px', color: '#28a745', fontWeight: 'bold' }}>{p.boughtPrice ? `${p.boughtPrice} Birr` : '0 Birr'}</td>
                    <td style={{ padding: '8px 10px' }}>{p.inStoreQty ?? p.inStore ?? 0}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{ background: qty < (p.stockThreshold || 5) ? '#f8d7da' : '#d1e7dd', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                        {qty}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', color: '#6c757d' }}>{p.invoiceNo || 'N/A'}</td>
                    <td style={{ padding: '8px 10px', color: exp ? '#fd7e14' : '#6c757d', fontWeight: exp ? 'bold' : 'normal' }}>
                      {exp ? new Date(exp).toLocaleDateString() : 'N/A'}
                    </td>
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

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '10px' }}>
          <div className="modal-content">
            <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Product Name */}
              <div>
                <label style={{ fontSize: '11px', color: '#6c757d' }}>Product Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize: '11px', color: '#6c757d' }}>Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
                >
                  {categories.length === 0 ? (
                    <option value="General">General</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat._id || cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Sale Price & Product Type */}
              <div className="form-grid-2">
                <div>
                  <label style={{ fontSize: '11px', color: '#6c757d' }}>Sale Price *</label>
                  <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#6c757d' }}>Product Type *</label>
                  <select
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
                  >
                    <option value="Stock">Stock</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
              </div>

              {/* Bought Price & Stock Threshold */}
              <div className="form-grid-2">
                <div>
                  <label style={{ fontSize: '11px', color: '#6c757d' }}>Bought Price (Birr) *</label>
                  <input type="number" required value={formData.boughtPrice} onChange={(e) => setFormData({ ...formData, boughtPrice: e.target.value })} placeholder="Required" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#6c757d' }}>Stock Threshold (optional)</label>
                  <input type="number" value={formData.stockThreshold} onChange={(e) => setFormData({ ...formData, stockThreshold: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Specific Type Dropdown */}
              <div>
                <label style={{ fontSize: '11px', color: '#6c757d' }}>Type (optional)</label>
                <select
                  value={formData.specificType}
                  onChange={(e) => setFormData({ ...formData, specificType: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
                >
                  <option value="">Select Type</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Suspension">Suspension</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Powder">Powder</option>
                  <option value="Cream">Cream</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Medical Device">Medical Device</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Is This Syrup Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="isSyrup"
                  checked={formData.isSyrup}
                  onChange={(e) => setFormData({ ...formData, isSyrup: e.target.checked })}
                />
                <label htmlFor="isSyrup" style={{ fontSize: '12px', color: '#6c757d', cursor: 'pointer' }}>Is This Syrup</label>
              </div>

              {/* In Store & In Shop Quantities */}
              <div className="form-grid-2">
                <div>
                  <label style={{ fontSize: '11px', color: '#6c757d' }}>In Store Qty</label>
                  <input type="number" value={formData.inStoreQty} onChange={(e) => setFormData({ ...formData, inStoreQty: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#6c757d' }}>In Shop Qty *</label>
                  <input type="number" required value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Invoice & Expiration Date */}
              <div className="form-grid-2">
                <div>
                  <label style={{ fontSize: '11px', color: '#6c757d' }}>Invoice # (Optional)</label>
                  <input type="text" placeholder="INV-XXXXX" value={formData.invoiceNo} onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#6c757d' }}>Expiration Date</label>
                  <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={handleCloseModal} style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
                <button type="submit" style={{ background: '#0d6efd', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {editingId ? 'Update Product' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;