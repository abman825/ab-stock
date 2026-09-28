import React, { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: ''
  });

  // 1. Authorization Header ማዘጋጀት
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };
  
  // 2. Suppliers መረጃን ከ Backend መቀበል
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

  // 3. Supplier ለማጥፋት (Delete)
  const handleDelete = async (id) => {
    if (window.confirm('ይህንን አቅራቢ (Supplier) ለማጥፋት እርግጠኛ ነዎት?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/suppliers/${id}`, { 
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        
        if (res.ok) {
          fetchSuppliers();
        } else {
          const errData = await res.json();
          alert(errData.message || 'አቅራቢውን ማጥፋት አልተቻለም');
        }
      } catch (err) {
        console.error('Error deleting supplier:', err);
      }
    }
  };

  // 4. Supplier ለመመዝገብ / ለማስተካከል (Create/Update)
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
        alert(errData.message || 'መረጃውን ማስቀመጥ አልተቻለም');
      }
    } catch (err) {
      console.error('Error saving supplier:', err);
    }
  };

  return (
    <div style={{ padding: '24px', flex: 1, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Suppliers</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            የግዢ አቅራቢዎችን እዚህ ይመዝግቡ እና ያስተዳድሩ
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
            fontSize: '13px'
          }}
        >
          + Add supplier
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px' }}>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>SUPPLIER NAME</th>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>PHONE</th>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>LOCATION</th>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  ምንክ አቅራቢ አልተመዘገበም።
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
                      style={{ background: 'transparent', color: '#2563eb', border: 'none', marginRight: '12px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sup._id)}
                      style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '13px' }}
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

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '400px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', color: '#0f172a' }}>
              {editingId ? 'Edit Supplier' : 'Add New Supplier'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px', display: 'block' }}>Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. General Supplier"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px', display: 'block' }}>Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +251 911 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px', display: 'block' }}>Location / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Addis Ababa"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={handleCloseModal} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
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

export default Suppliers;