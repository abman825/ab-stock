import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductModal from './ProductModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // LocalStorage ወይም ከ User Auth Data የንግድ ዓይነቱን መቀበል (Default: 'pharmacy')
  const [businessType, setBusinessType] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.businessType || 'pharmacy';
      } catch (e) {
        return 'pharmacy';
      }
    }
    return localStorage.getItem('businessType') || 'pharmacy';
  });

  const initialFormState = {
    name: '',
    category: 'General',
    productType: 'Stock',
    boughtPrice: '',
    price: '',
    stockThreshold: '',
    specificType: '',
    unit: '',
    isSyrup: false,
    expiryDate: '',
    inStoreQty: '',
    quantity: '',
    invoiceNo: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch Products and Categories on load or when businessType changes
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [businessType]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/products?businessType=${businessType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (error) {
      console.error('ምርቶችን መጫን አልተቻለም:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (error) {
      console.error('ካቴጎሪዎችን መጫን አልተቻለም:', error);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name || '',
      category: product.category || 'General',
      productType: product.productType || 'Stock',
      boughtPrice: product.boughtPrice || '',
      price: product.price || '',
      stockThreshold: product.stockThreshold || '',
      specificType: product.specificType || '',
      unit: product.unit || '',
      isSyrup: product.isSyrup || false,
      expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
      inStoreQty: product.inStoreQty || '',
      quantity: product.quantity || '',
      invoiceNo: product.invoiceNo || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        boughtPrice: Number(formData.boughtPrice),
        price: Number(formData.price),
        stockThreshold: Number(formData.stockThreshold) || 0,
        inStoreQty: Number(formData.inStoreQty) || 0,
        quantity: Number(formData.quantity) || 0,
        businessType: businessType
      };

      if (editingId) {
        await axios.put(`/api/products/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('ምርቱ በትክክል ተሻሽሏል!');
      } else {
        await axios.post('/api/products', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('ምርቱ በትክክል ተመዝግቧል!');
      }

      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error('ምርት በሚመዘገብበት ጊዜ ስህተት ተፈጥሯል:', error);
      alert('ምርቱን መመዝገብ አልተቻለም!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('ይህን ምርት ለማጥፋት እርግጠኛ ነዎት?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchProducts();
      } catch (error) {
        console.error('ምርቱን ማጥፋት አልተቻለም:', error);
      }
    }
  };

  // Filter products based on search and stock status
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === 'In stock') return matchesSearch && p.quantity > 0;
    if (filterType === 'Low stock') return matchesSearch && p.quantity <= (p.stockThreshold || 5);
    if (filterType === 'Out of stock') return matchesSearch && p.quantity === 0;
    return matchesSearch;
  });

  const isBuildingMode =
    businessType === 'building' ||
    businessType === 'building_materials' ||
    businessType === 'buildingMaterials';

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Product Management</h2>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0d6efd' }}>
            {isBuildingMode ? '📌 BUILDING MATERIALS MODE' : '💊 PHARMACY MODE'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Import
          </button>
          <button
            onClick={handleOpenAddModal}
            style={{ padding: '8px 16px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            + Add product
          </button>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', width: '250px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <div style={{ display: 'flex', gap: '5px' }}>
          {['All', 'In stock', 'Low stock', 'Out of stock'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '6px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: filterType === type ? '#0d6efd' : '#f8f9fa',
                color: filterType === type ? '#fff' : '#000',
                cursor: 'pointer'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Table Data */}
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f1f3f5', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '10px' }}>NAME</th>
              <th style={{ padding: '10px' }}>CATEGORY</th>
              <th style={{ padding: '10px' }}>PROD TYPE</th>
              <th style={{ padding: '10px' }}>TYPE</th>
              {isBuildingMode && <th style={{ padding: '10px' }}>UNIT</th>}
              <th style={{ padding: '10px' }}>SALE PRICE</th>
              <th style={{ padding: '10px' }}>BOUGHT PRICE</th>
              <th style={{ padding: '10px' }}>IN STORE</th>
              <th style={{ padding: '10px' }}>IN SHOP</th>
              <th style={{ padding: '10px' }}>INVOICE #</th>
              {!isBuildingMode && <th style={{ padding: '10px' }}>EXPIRY DATE</th>}
              <th style={{ padding: '10px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center', padding: '20px' }}>
                  ምንም የተመዘገበ ምርት አልተገኘም።
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid #e9ecef' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.name}</td>
                  <td style={{ padding: '10px' }}>{p.category}</td>
                  <td style={{ padding: '10px' }}>{p.productType}</td>
                  <td style={{ padding: '10px' }}>{p.specificType || '-'}</td>
                  {isBuildingMode && <td style={{ padding: '10px' }}>{p.unit || '-'}</td>}
                  <td style={{ padding: '10px' }}>{p.price} Birr</td>
                  <td style={{ padding: '10px' }}>{p.boughtPrice} Birr</td>
                  <td style={{ padding: '10px' }}>{p.inStoreQty || 0}</td>
                  <td style={{ padding: '10px' }}>{p.quantity || 0}</td>
                  <td style={{ padding: '10px' }}>{p.invoiceNo || 'N/A'}</td>
                  {!isBuildingMode && (
                    <td style={{ padding: '10px' }}>
                      {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : 'N/A'}
                    </td>
                  )}
                  <td style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      style={{ padding: '4px 8px', background: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Render Product Modal */}
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
};

export default Products;