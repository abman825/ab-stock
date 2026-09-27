import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

function Categories() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    categoryId: '',
    name: ''
  });

  // Helper Function for Axios Headers with Authorization Token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    };
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories`, getAuthHeaders());
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditClick = (cat) => {
    setEditingId(cat._id);
    setFormData({
      categoryId: cat.categoryId,
      name: cat.name
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ categoryId: '', name: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('ይህንን Category ለማጥፋት እርግጠኛ ነዎት?')) {
      try {
        await axios.delete(`${API_URL}/api/categories/${id}`, getAuthHeaders());
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
      if (editingId) {
        await axios.put(`${API_URL}/api/categories/${editingId}`, formData, config);
      } else {
        await axios.post(`${API_URL}/api/categories`, formData, config);
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  // CSV File Import Handler
  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Format data to match Category Schema
          const formattedCategories = results.data.map((item) => ({
            name: item.name || item.CategoryName || item.Name,
            categoryId: item.categoryId || item.CategoryId || Math.floor(1000 + Math.random() * 9000).toString(),
            productsCount: Number(item.productsCount) || 0
          })).filter(c => c.name);

          if (formattedCategories.length === 0) {
            alert('በCSV ፋይሉ ውስጥ ትክክለኛ Category ዳታ አልተገኘም!');
            return;
          }

          // Send bulk insert request to Backend with Auth Headers
          await axios.post(`${API_URL}/api/categories/bulk`, formattedCategories, getAuthHeaders());
          alert(`${formattedCategories.length} Categories በተሳካ ሁኔታ Import ሆነዋል!`);
          fetchCategories();
        } catch (err) {
          console.error('CSV Import Error:', err);
          alert('Import በሚደረግበት ወቅት ስህተት ተፈጽሟል!');
        }
      }
    });

    // Reset file input
    e.target.value = '';
  };

  const filteredCategories = categories.filter((cat) =>
    (cat.name && cat.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cat.categoryId && cat.categoryId.toString().includes(searchTerm))
  );

  return (
    <div style={{ padding: '20px', flex: 1, backgroundColor: '#f4f6f8' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#333', margin: 0 }}>Category Management</h2>
        
        {/* Search & Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '7px 12px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              width: '160px',
              fontSize: '13px',
              backgroundColor: '#fff'
            }}
          />

          <button
            onClick={() => { setEditingId(null); setShowModal(true); }}
            style={{
              backgroundColor: '#0d6efd',
              color: '#fff',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '5px',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            + Add Category
          </button>

          {/* Hidden CSV Input File */}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleCSVImport}
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current.click()}
            style={{
              backgroundColor: '#fff',
              color: '#333',
              border: '1px solid #ccc',
              padding: '7px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            📥 Import
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e0e0e0', color: '#666', fontSize: '11px', letterSpacing: '0.5px' }}>
              <th style={{ padding: '10px 16px', fontWeight: '600' }}>CATEGORY ID</th>
              <th style={{ padding: '10px 16px', fontWeight: '600' }}>NAME</th>
              <th style={{ padding: '10px 16px', fontWeight: '600' }}>PRODUCTS</th>
              <th style={{ padding: '10px 16px', fontWeight: '600' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#888' }}>
                  No categories found.
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 16px', color: '#555' }}>{cat.categoryId}</td>
                  <td style={{ padding: '12px 16px', fontWeight: '500', color: '#222' }}>{cat.name}</td>
                  <td style={{ padding: '12px 16px', color: '#555' }}>{cat.productsCount || 0}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => handleEditClick(cat)}
                      style={{
                        background: 'transparent',
                        color: '#0d6efd',
                        border: 'none',
                        marginRight: '12px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      style={{
                        background: 'transparent',
                        color: '#dc3545',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '6px', width: '380px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#333' }}>
              {editingId ? 'Edit Category' : 'Add Category'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#666', marginBottom: '4px', display: 'block' }}>Category ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 2813"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#666', marginBottom: '4px', display: 'block' }}>Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cosmetics"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={handleCloseModal} style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ backgroundColor: '#0d6efd', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                  {editingId ? 'Update' : 'Save'}
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