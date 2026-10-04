import React, { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

function Transfer() {
  const [transfers, setTransfers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // 1. businessType ምልላይ (pharmacy ወይ building_materials)
  const [businessType, setBusinessType] = useState(
    localStorage.getItem('businessType') || 'pharmacy'
  );

  const isBuilding = businessType === 'building' || businessType === 'building_materials' || businessType === 'buildingMaterials';
  const currentBusinessType = isBuilding ? 'building_materials' : 'pharmacy';

  const [formData, setFormData] = useState({
    from: 'store',
    to: 'shop',
    transferredBy: 'ab'
  });

  // Helper Function for Auth Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  // 2. Mode እንተተቐይሩ ንክቕየር ምግባር
  useEffect(() => {
    const handleModeChange = () => {
      const currentMode = localStorage.getItem('businessType') || 'pharmacy';
      setBusinessType(currentMode);
    };

    window.addEventListener('businessTypeChanged', handleModeChange);
    window.addEventListener('storage', handleModeChange);
    return () => {
      window.removeEventListener('businessTypeChanged', handleModeChange);
      window.removeEventListener('storage', handleModeChange);
    };
  }, []);

  // 3. ብ businessType መሰረት Transfers fetch ምግባር
  useEffect(() => {
    fetchTransfers();
  }, [businessType]);

  const fetchTransfers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/transfers?businessType=${currentBusinessType}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // Frontend filter (እንተደኣ Backend filter ዘይገበረ ኮይኑ)
        const filtered = data.filter((item) => {
          const type = (item.businessType || '').toLowerCase();
          if (isBuilding) {
            return type === 'building_materials' || type.includes('building');
          }
          return type === 'pharmacy' || type === '' || !item.businessType;
        });
        setTransfers(filtered);
      }
    } catch (err) {
      console.error('Error fetching transfers:', err);
    }
  };

  // 4. ብ active businessType መሰረት Transfer ምፍጣር
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        businessType: currentBusinessType
      };

      const res = await fetch(`${API_BASE_URL}/transfers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        fetchTransfers();
      }
    } catch (err) {
      console.error('Error creating transfer:', err);
    }
  };

  return (
    <div style={{ padding: '25px', backgroundColor: '#f8f9fa', flex: 1, overflowY: 'auto' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#212529', margin: 0 }}>Product Transfer</h2>
          <span style={{ fontSize: '11px', color: '#0d6efd', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {isBuilding ? '🏗️ Building Materials Mode' : '💊 Pharmacy Mode'}
          </span>
          <p style={{ fontSize: '13px', color: '#6c757d', margin: '5px 0 0 0' }}>
            Transfer products from store to shop or from shop to store.<br />
            <span style={{ fontSize: '12px', color: '#8c98a4' }}>
              Products which are transferred from store to shop will be added into your sale page.
            </span>
          </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          style={{
            backgroundColor: '#0d6efd',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          + Transfer Product
        </button>
      </div>

      {/* Table Section */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e9ecef', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', color: '#6c757d', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 15px' }}>DATE</th>
              <th style={{ padding: '12px 15px' }}>FROM</th>
              <th style={{ padding: '12px 15px' }}>TO</th>
              <th style={{ padding: '12px 15px' }}>BY</th>
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                  No transfer records found for {isBuilding ? 'Building Materials' : 'Pharmacy'}.
                </td>
              </tr>
            ) : (
              transfers.map((item, idx) => (
                <tr key={item._id || idx} style={{ borderBottom: '1px solid #f1f3f5' }}>
                  <td style={{ padding: '12px 15px', color: '#495057' }}>
                    {new Date(item.date || item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 15px', color: '#495057' }}>{item.from}</td>
                  <td style={{ padding: '12px 15px', color: '#495057' }}>{item.to}</td>
                  <td style={{ padding: '12px 15px', color: '#495057' }}>{item.transferredBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Transfer Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', width: '400px', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              New Transfer ({isBuilding ? 'Building Materials' : 'Pharmacy'})
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>From</label>
                <select 
                  value={formData.from}
                  onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="store">Store</option>
                  <option value="stock">Stock</option>
                  <option value="shop">Shop</option>
                  <option value="pharmacy">Pharmacy</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>To</label>
                <select 
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="shop">Shop</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="stock">Stock</option>
                  <option value="store">Store</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Transferred By</label>
                <input 
                  type="text"
                  value={formData.transferredBy}
                  onChange={(e) => setFormData({ ...formData, transferredBy: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '6px 12px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '6px 12px', border: 'none', background: '#0d6efd', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Transfer;