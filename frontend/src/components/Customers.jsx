import React, { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

const translations = {
  am: {
    title: "የደንበኞች አስተዳደር (Customer Management)",
    addNewCustomer: "አዲስ ደንበኛ መመዝገቢያ",
    customerName: "የደንበኛ ስም *",
    phoneNumber: "ስልክ ቁጥር *",
    emailAddress: "ኢሜይል አድራሻ",
    address: "አድራሻ",
    saving: "በመመዝገብ ላይ...",
    saveCustomer: "ደንበኛ መዝግብ",
    customerList: "የደንበኞች ዝርዝር",
    name: "ስም",
    phone: "ስልክ",
    email: "ኢሜይል",
    addressCol: "አድራሻ",
    totalDebt: "ጠቅላላ ዕዳ (ዱቤ)",
    actions: "ተግባር",
    payDebt: "ዕዳ ክፈል",
    noCustomers: " ምንም የተመዘገበ ደንበኛ የለም።",
    fillRequired: "እባክዎን ስም እና ስልክ ቁጥር ያስገቡ!",
    enterPaymentAmount: "እባክዎን የከፈለውን የገንዘብ መጠን ያስገቡ!",
    payDebtModalTitle: "የዱቤ ክፍያ መቀበያ"
  },
  om: {
    title: "Gulaala Maamiltootaa (Customer Management)",
    addNewCustomer: "Maamila Haaraa Galmeessi",
    customerName: "Maqaa Maamilaa *",
    phoneNumber: "Lakkoofsa Bilbilaa *",
    emailAddress: "Teessoo E-mail",
    address: "Teessoo / Bakka",
    saving: "Galmeessaa jira...",
    saveCustomer: "Maamila Galmeessi",
    customerList: "Tarree Maamiltootaa",
    name: "Maqaa",
    phone: "Bilbila",
    email: "E-mail",
    addressCol: "Teessoo",
    totalDebt: "Idaa Waliigalaa",
    actions: "Tarkaanfii",
    payDebt: "Idaa Kaffali",
    noCustomers: "Maamilli galmeeffame tokkollee hin jiru.",
    fillRequired: "Maaloo maqaa fi lakkoofsa bilbilaa galchaa!",
    enterPaymentAmount: "Mallaqa kaffalame galchaa!",
    payDebtModalTitle: "Kaffaltii Idaa Fudhachuu"
  },
  en: {
    title: "Customer Management",
    addNewCustomer: "Add New Customer",
    customerName: "Customer Name *",
    phoneNumber: "Phone Number *",
    emailAddress: "Email Address",
    address: "Address",
    saving: "Saving...",
    saveCustomer: "Save Customer",
    customerList: "Customer List",
    name: "Name",
    phone: "Phone",
    email: "Email",
    addressCol: "Address",
    totalDebt: "Total Debt",
    actions: "Actions",
    payDebt: "Pay Debt",
    noCustomers: "No customers found.",
    fillRequired: "Please enter both name and phone number!",
    enterPaymentAmount: "Please enter payment amount!",
    payDebtModalTitle: "Receive Debt Payment"
  }
};

function Customers({ currentLang }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustForPay, setSelectedCustForPay] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const lang = currentLang || localStorage.getItem('appLanguage') || 'am';
  const t = translations[lang] || translations.am;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ደንበኞችንና የዕዳ መጠናቸውን ከዳታቤዝ በቀጥታ መውሰድ
  const fetchCustomers = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/customers`, { headers });

      if (res.ok) {
        const custData = await res.json();
        setCustomers(custData);
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
      alert(t.fillRequired);
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayModal = (cust) => {
    setSelectedCustForPay(cust);
    setPayAmount('');
    setIsPayModalOpen(true);
  };

  const handleProcessDebtPayment = async () => {
  if (!payAmount || Number(payAmount) <= 0) {
    alert(t.enterPaymentAmount);
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/orders/pay-debt`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        customerId: selectedCustForPay._id,
        amount: Number(payAmount),
        paymentMethod: payMethod // 👉 የተመረጠውን የክፍያ መንገድ መላክ
      })
    });

    if (res.ok) {
      alert("የዱቤ ክፍያው በጥሩ ሁኔታ ተመዝግቧል!");
      setIsPayModalOpen(false);
      fetchCustomers();
    } else {
      alert("ክፍያውን ለመመዝገብ አልተቻለም።");
    }
  } catch (err) {
    alert("ስህተት ተከሰቷል።");
  }
};

  return (
    <div style={{ padding: '25px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Title */}
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
        👥 {t.title}
      </h2>

      {/* Form */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', color: '#495057' }}>
          {t.addNewCustomer}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <input
            type="text"
            name="name"
            placeholder={t.customerName}
            value={formData.name}
            onChange={handleChange}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '13px' }}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder={t.phoneNumber}
            value={formData.phone}
            onChange={handleChange}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '13px' }}
            required
          />
          <input
            type="email"
            name="email"
            placeholder={t.emailAddress}
            value={formData.email}
            onChange={handleChange}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '13px' }}
          />
          <input
            type="text"
            name="address"
            placeholder={t.address}
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
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? t.saving : t.saveCustomer}
          </button>
        </form>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', color: '#495057' }}>
          {t.customerList} ({customers.length})
        </h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '10px', color: '#495057' }}>{t.name}</th>
              <th style={{ padding: '10px', color: '#495057' }}>{t.phone}</th>
              <th style={{ padding: '10px', color: '#495057' }}>{t.addressCol}</th>
              <th style={{ padding: '10px', color: '#dc3545' }}>{t.totalDebt}</th>
              <th style={{ padding: '10px', color: '#495057' }}>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '15px', textAlign: 'center', color: '#6c757d' }}>
                  {t.noCustomers}
                </td>
              </tr>
            ) : (
              customers.map((cust) => {
                const debt = Number(cust.totalDebt || 0);
                return (
                  <tr key={cust._id} style={{ borderBottom: '1px solid #e9ecef' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{cust.name}</td>
                    <td style={{ padding: '10px' }}>{cust.phone}</td>
                    <td style={{ padding: '10px' }}>{cust.address || '-'}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: debt > 0 ? '#dc3545' : '#198754' }}>
                      {debt.toFixed(2)} ETB
                    </td>
                    <td style={{ padding: '10px' }}>
                      {debt > 0 && (
                        <button
                          onClick={() => handleOpenPayModal(cust)}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: '#198754',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          💳 {t.payDebt}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pay Debt Modal */}
      {isPayModalOpen && selectedCustForPay && (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '330px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{t.payDebtModalTitle}</h3>
      <p style={{ fontSize: '13px', margin: '5px 0' }}><strong>ደንበኛ:</strong> {selectedCustForPay.name}</p>
      <p style={{ fontSize: '13px', margin: '5px 0', color: '#dc3545' }}><strong>ያለበት ዕዳ:</strong> {Number(selectedCustForPay.totalDebt || 0).toFixed(2)} ETB</p>
      
      {/* የገንዘብ መጠን ማስገቢያ */}
      <div style={{ marginTop: '12px' }}>
        <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>የከፈለው መጠን (ብር):</label>
        <input
          type="number"
          placeholder="0.00"
          value={payAmount}
          onChange={(e) => setPayAmount(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
      </div>

      {/* 👉 አዲስ የተጨመረ፡ የክፍያ መንገድ መምረጫ */}
      <div style={{ marginTop: '12px' }}>
        <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>የክፍያ መንገድ፦</label>
        <select
          value={payMethod}
          onChange={(e) => setPayMethod(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', fontSize: '13px' }}
        >
          <option value="cash">💵 ካሽ (Cash)</option>
          <option value="bank">🏦 ባንክ (Bank)</option>
          <option value="telebirr">📱 ቴሌብር (Telebirr)</option>
        </select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
        <button
          onClick={() => setIsPayModalOpen(false)}
          style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: '#6c757d', color: '#fff' }}
        >
          ሰርዝ
        </button>
        <button
          onClick={handleProcessDebtPayment}
          style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: '#198754', color: '#fff', fontWeight: 'bold' }}
        >
          ክፍያ መዝግብ
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default Customers;