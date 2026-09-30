import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://ab-stock.onrender.com';

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // 1. ከ Backend Token እናስጠይቃለን
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'ኢሜይሉ አልተገኘም');
      }

      // 2. Token ከተገኘ በኋላ በ EmailJS አማካኝነት ወደ ተጠቃሚው ኢሜይል እንልካለን
      const resetLink = `${window.location.origin}/reset-password/${data.resetToken}`;

     const templateParams = {
  to_name: email.split('@')[0],
  to_email: email,
  email: email, // <-- Ha badal zaroori ahe! {{email}} la hi value pahije.
  passcode: data.resetToken,
};

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_ymprcgb';
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_ge1whgb';
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'OarV3EdpFEn1i2d9v';

      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      setMessage('የይለፍ ቃል መቀየሪያ ሊንክ ወደ ኢሜይልዎ ተልኳል! እባክዎን ኢሜይልዎን ያረጋግጡ።');
      setEmail('');
    } catch (err) {
      console.error('Forgot Password Error:', err);
      setError(err.message || 'ችግር አጋጥሟል! እባክዎን ድጋሚ ይሞክሩ።');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#eef2f5', padding: '20px' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px' }}>
        
        <h2 style={{ textAlign: 'center', color: '#0b5ed7', marginBottom: '10px', fontWeight: 'bold' }}>
          Forgot Password
        </h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginBottom: '20px' }}>
          ኢሜይልዎን ያስገቡ፤ የይለፍ ቃል መቀየሪያ ሊንክ እንልክልዎታለን።
        </p>

        {error && <div style={{ color: '#842029', backgroundColor: '#f8d7da', border: '1px solid #f5c2c7', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}
        {message && <div style={{ color: '#0f5132', backgroundColor: '#d1e7dd', border: '1px solid #badbcc', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Email Address</label>
            <input
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px',
              background: '#0b5ed7',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <span
            onClick={onBackToLogin}
            style={{ color: '#0b5ed7', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
          >
            Back to Login
          </span>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;