import React, { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

function PurchaseOrders() {
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

  // Authorization Header ማዘጋጃ
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  // Data Fetching
  const fetchData = async () => {
    try {
      const config = { headers: getAuthHeaders() };

      const [poRes, supRes, prodRes] = await Promise.all([
        fetch(`${API_URL}/api/purchase-orders`, config),
        fetch(`${API_URL}/api/suppliers`, config),
        fetch(`${API_URL}/api/products`, config)
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
  }, []);

  // CSV Import Functionality
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

          // Regex በመጠቀም በሴል ውስጥ ያለን ኮማ ጥስስ እንዳያደርገው ይረዳል
          const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || line.split(',');
          const cleanValues = values.map((val) => val.replace(/^"|"$/g, '').trim());

          if (cleanValues.length >= 2) {
            const qty = Number(cleanValues[1]) || 1;
            const uCost = Number(cleanValues[2]) || 0;

            importedOrders.push({
              productName: cleanValues[0] || 'Imported Product',
              quantity: qty,
              unitCost: uCost,
              totalCost: qty * uCost,
              supplierName: cleanValues[3] || (suppliers.length > 0 ? suppliers[0].name : 'General'),
              invoiceNumber: cleanValues[4] || `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            });
          }
        }

        if (importedOrders.length > 0) {
          const res = await fetch(`${API_URL}/api/purchase-orders/bulk`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(importedOrders)
          });

          if (res.ok) {
            alert('የመረጧቸው የ CSV ግዢዎች በትክክል ተመዝግበዋል!');
            fetchData();
          } else {
            const errorData = await res.json().catch(() => ({}));
            alert(`ግዢዎችን ማስገባት አልተቻለም: ${errorData.message || 'Server Error'}`);
          }
        } else {
          alert('የመረጡት CSV ፋይል ባዶ ነው ወይም ትክክለኛ መረጃ አልያዘም።');
        }
      } catch (err) {
        console.error('Error importing CSV:', err);
        alert('CSV ፋይሉን በማንበብ ሂደት ላይ ስህተት ተፈጥሯል!');
      }

      e.target.value = null; // Input ን reset ለማድረግ
    };
    reader.readAsText(file);
  };

  const handleProductSelect = (e) => {
    const selectedId = e.target.value;
    const selectedProd = products.find((p) => p._id === selectedId);
    if (selectedProd) {
      setFormData({
        ...formData,
        productId: selectedProd._id,
        productName: selectedProd.name,
        unitCost: selectedProd.boughtPrice || selectedProd.price || 0
      });
    } else {
      setFormData({ ...formData, productId: '', productName: '', unitCost: 0 });
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        unitCost: Number(formData.unitCost),
        totalCost: Number(formData.quantity) * Number(formData.unitCost)
      };

      const res = await fetch(`${API_URL}/api/purchase-orders`, {
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
        alert(`Purchase Order ማስገባት አልተቻለም: ${errData.message || 'Server Error'}`);
      }
    } catch (err) {
      console.error('Error creating purchase order:', err);
    }
  };

  return (
    <div style={{ padding: '24px', flex: 1, backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Purchase</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '6px 0 0 0' }}>
            Add inventory by creating a purchase.<br />
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Stock will be added to your warehouse.</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            + Create Purchase
          </button>

          {/* Import Purchases Label/Button */}
          <label
            style={{
              backgroundColor: '#fff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '9px 16px',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📥 Import Purchases
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
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', minWidth: '650px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>DATE</th>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>PURCHASED ITEMS</th>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>TOTAL AMOUNT</th>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>SUPPLIER</th>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>INVOICE NUMBER</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  No purchases recorded yet.
                </td>
              </tr>
            ) : (
              orders.map((po) => (
                <tr key={po._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>
                    {new Date(po.createdAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: '500', color: '#0f172a' }}>
                    {po.quantity} Item{po.quantity > 1 ? 's' : ''} ({po.productName})
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: '500', color: '#0f172a' }}>
                    ETB {po.totalCost ? po.totalCost.toLocaleString() : (po.quantity * po.unitCost || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#475569' }}>{po.supplierName}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b', fontFamily: 'monospace' }}>
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '10px' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '420px', boxSizing: 'border-box' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', color: '#0f172a' }}>
              Create New Purchase
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px', display: 'block' }}>Supplier *</label>
                <select
                  required
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s._id || s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px', display: 'block' }}>Product *</label>
                <select
                  required
                  value={formData.productId}
                  onChange={handleProductSelect}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (
                    <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px', display: 'block' }}>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px', display: 'block' }}>Unit Cost (ETB)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px', display: 'block' }}>Invoice Number (Optional)</label>
                <input
                  type="text"
                  placeholder="INV-XXXXXX"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                  Save Purchase
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