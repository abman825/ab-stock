import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

// በ import.meta.env ፈንታ የ Render URLህን ቀጥታ አስገብተህ ተመልከተው
const API_URL = import.meta.env.VITE_API_URL || 'https://ab-stock.onrender.com'; // Backend URLህን እዚህ ጋር ተካው

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [isSent, setIsSent] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. ኢሜይል ልኮ ቁጥር (OTP) ለመቀበል
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
});

// Response-ኡ JSON መሆኑን እና ባዶ አለመሆኑን ማረጋገጫ
const text = await res.text();
let data = {};
try {
  data = text ? JSON.parse(text) : {};
} catch (e) {
  throw new Error('የሴርቨር መልስ አልተገኘም (Server returned invalid JSON)');
}

if (!res.ok) {
  throw new Error(data.message || 'ተጠቃሚው አልተገኘም ወይም የሴርቨር ስህተት አለ');
}

      // EmailJS Params
      const templateParams = {
        to_name: email.split('@')[0],
        to_email: email,
        email: email,
        passcode: data.resetToken, // ከ Backend resetToken ተብሎ የመጣውን OTP ይጠቀማል
      };

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_ymprcgb';
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_gelwhgb';
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'OarV3EdPFEn1i2d9v';

      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      setMessage('የይለፍ ቃል መለወጫ ኮዱ ወደ ኢሜይልዎ ተልኳል! እባክዎን ኢሜይልዎን ያረጋግጡ።');
      setIsSent(true);

    } catch (err) {
      console.error('Forgot Password Error:', err);
      setError(err.message || 'ችግር አጋጥሟል! እባክዎን ደግመው ይሞክሩ።');
    } finally {
      setLoading(false);
    }
  };

  // 2. የተላከውን ቁጥር እና አዲስ ፓስወርድ ልኮ ፓስወርዱን ለመቀየር
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: otp,            // Backendህ 'code' ነው የሚፈልገው
          password: newPassword // Backendህ 'password' ነው የሚፈልገው
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'ኮዱ የተሳሳተ ነው ወይም ጊዜው አልፏል');
      }

      setMessage('ፓስወርድዎ በትክክል ተቀይሯል! አሁን መግባት ይችላሉ።');
      
      setTimeout(() => {
        if (onBackToLogin) onBackToLogin();
      }, 2000);

    } catch (err) {
      console.error('Reset Password Error:', err);
      setError(err.message || 'ፓስወርዱን መቀየር አልተቻለም');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
      <h2>Forgot Password</h2>

      {message && <div style={{ color: 'green', background: '#e8f5e9', padding: '10px', marginBottom: '15px' }}>{message}</div>}
      {error && <div style={{ color: 'red', background: '#ffebee', padding: '10px', marginBottom: '15px' }}>{error}</div>}

      {!isSent ? (
        <form onSubmit={handleSendCode}>
          <p>ኢሜይልዎን ያስገቡ፤ የይለፍ ቃል መለወጫ ኮድ እንልካለን።</p>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', margin: '10px 0', boxSizing: 'border-box' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0066cc', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            {loading ? 'እየላከ ነው...' : 'Send Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <p>ወደ ኢሜይልዎ የተላከውን 6 አሃዝ ኮድ እና አዲስ ፓስወርድ ያስገቡ።</p>
          <input
            type="text"
            placeholder="Enter 6-digit Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', margin: '8px 0', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', margin: '8px 0', boxSizing: 'border-box' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            {loading ? 'እየቀየረ ነው...' : 'Change Password'}
          </button>
        </form>
      )}

      <button
        onClick={onBackToLogin}
        style={{ marginTop: '15px', background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer' }}
      >
        Back to Login
      </button>
    </div>
  );
}

export default ForgotPassword;