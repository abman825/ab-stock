import React, { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  // Helper Function for Auth Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  // የደንበኞችን መረጃ ከ Backend ማምጣት
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.log("Error fetching customers:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("እባክዎን ስም እና ስልክ ቁጥር ያስገቡ");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const newCustomer = await res.json();
        setCustomers([newCustomer, ...customers]);
        setFormData({ name: '', email: '', phone: '', address: '' });
      } else {
        // Backend API ካልመለሰ በስተቀር (locally) ጊዜያዊ መረጃ መጨመር
        const newCustomer = { ...formData, _id: Date.now().toString() };
        setCustomers([newCustomer, ...customers]);
        setFormData({ name: '', email: '', phone: '', address: '' });
      }
    } catch (err) {
      // ኤፒአይ ከሌለ ወይም ስህተት ከተፈጠረ በስተቀር (locally) መጨመር
      const newCustomer = { ...formData, _id: Date.now().toString() };
      setCustomers([newCustomer, ...customers]);
      setFormData({ name: '', email: '', phone: '', address: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '25px', width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
        👥 Customer Management
      </h2>

      {/* አዲስ ደንበኛ መመዝገቢያ ፎርም */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', color: '#495057' }}>
          Add New Customer
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <input
            type="text"
            name="name"
            placeholder="Customer Name *"
            value={formData.name}
            onChange={handleChange}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '13px' }}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number *"
            value={formData.phone}
            onChange={handleChange}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '13px' }}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '13px' }}
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '13px' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0d6efd',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            {loading ? 'Saving...' : 'Save Customer'}
          </button>
        </form>
      </div>

      {/* የደንበኞች ሠንጠረዥ */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', color: '#495057' }}>
          Customer List ({customers.length})
        </h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '10px', color: '#495057' }}>Name</th>
              <th style={{ padding: '10px', color: '#495057' }}>Phone</th>
              <th style={{ padding: '10px', color: '#495057' }}>Email</th>
              <th style={{ padding: '10px', color: '#495057' }}>Address</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '15px', textAlign: 'center', color: '#6c757d' }}>
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((cust) => (
                <tr key={cust._id} style={{ borderBottom: '1px solid #e9ecef' }}>
                  <td style={{ padding: '10px', fontWeight: '500' }}>{cust.name}</td>
                  <td style={{ padding: '10px' }}>{cust.phone}</td>
                  <td style={{ padding: '10px' }}>{cust.email || '-'}</td>
                  <td style={{ padding: '10px' }}>{cust.address || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Customers;