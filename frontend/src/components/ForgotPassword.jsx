import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // 1. Backend Request - resetToken ለማግኘት
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'ኢሜይሉን ማግኘት አልተቻለም!');
      }

      // 2. የ Reset Link ማዘጋጀት
      const resetUrl = `${window.location.origin}/reset-password/${data.resetToken}`;

      // 3. EmailJS ን በመጠቀም ኢሜይሉን ለተጠቃሚው መላክ
      const templateParams = {
        to_email: email,
        link: resetUrl
      };

      await emailjs.send(
        'service_ymprcgb',   // 'YOUR_' የሚለው ተወግዷል
        'template_ge1whgb',  // 'YOUR_' የሚለው ተወግዷል
        templateParams,
        'OarV3EdpFEn1i2d9v'   
      );

      setMessage('የይለፍ ቃል መቀየሪያ ሊንክ ወደ ኢሜይልዎ ተልኳል! እባክዎን ኢሜይልዎን ያረጋግጡ።');
      setEmail('');
    } catch (err) {
      setError(err.message || 'ችግር አጋጥሟል! እባክዎ ድጋሚ ይሞክሩ።');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#eef2f5', padding: '20px' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px' }}>
        <h2 style={{ textAlign: 'center', color: '#0b5ed7', marginBottom: '15px', fontWeight: 'bold' }}>Forgot Password</h2>
        <p style={{ textAlign: 'center', color: '#666', fontSize: '13px', marginBottom: '20px' }}>
          ኢሜይልዎን ያስገቡ፤ የይለፍ ቃል መቀየሪያ ሊንክ እንልክልዎታለን።
        </p>

        {error && <div style={{ color: '#842029', backgroundColor: '#f8d7da', border: '1px solid #f5c2c7', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}
        {message && <div style={{ color: '#0f5132', backgroundColor: '#d1e7dd', border: '1px solid #badbcc', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
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
              background: loading ? '#6c757d' : '#0b5ed7',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              marginTop: '5px'
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '13px' }}>
          <span onClick={onBackToLogin} style={{ color: '#0b5ed7', cursor: 'pointer', fontWeight: 'bold' }}>
            Back to Login
          </span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;