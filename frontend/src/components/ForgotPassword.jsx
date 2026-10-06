import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Dynamic multi-language translations
const translations = {
  am: {
    title: "የይለፍ ቃል አትርሰዋል? (Forgot Password)",
    description: "ኢሜይልዎን ያስገቡ፤ የይለፍ ቃል መቀየሪያ ሊንክ እንልክልዎታለን።",
    emailLabel: "ኢሜይል አድራሻ",
    emailPlaceholder: "ኢሜይልዎን ያስገቡ",
    emailNotFound: "ኢሜይሉን ማግኘት አልተቻለም!",
    successMsg: "የይለፍ ቃል መቀየሪያ ሊንክ ወደ ኢሜይልዎ ተልኳል! እባክዎን ኢሜይልዎን ያካሂዱ።",
    defaultError: "ችግር አጋጥሟል! እባክዎ ድጋሚ ይሞክሩ።",
    sending: "በመላክ ላይ...",
    sendBtn: "የመቀየሪያ ሊንክ ላክ",
    backToLogin: "ወደ መግቢያ ገጽ ተመለስ"
  },
  om: {
    title: "Jecha Darbiisaa Dagattanii? (Forgot Password)",
    description: "Teessoo E-mail keessan galchaa; liinkii jecha darbiisaa ittiin jijjiirtan isiniif ni ergitinaa.",
    emailLabel: "Teessoo E-mail",
    emailPlaceholder: "E-mail keessan galchaa",
    emailNotFound: "E-mail argachuu hin danda'amne!",
    successMsg: "Liinkiin jecha darbiisaa jijjiiruu gara E-mail keessaniitti ergameera! Maaloo E-mail keessan checked godhaa.",
    defaultError: "Rakkoon uumameera! Maaloo irra deebi'aatii yaalaa.",
    sending: "Ergamaa jira...",
    sendBtn: "Liinkii Jijjiirraa Ergi",
    backToLogin: "Gara Seensaatti Deebi'i"
  },
  en: {
    title: "Forgot Password",
    description: "Enter your email address and we will send you a reset link.",
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email",
    emailNotFound: "Email not found!",
    successMsg: "A password reset link has been sent to your email! Please check your inbox.",
    defaultError: "An error occurred! Please try again.",
    sending: "Sending...",
    sendBtn: "Send Reset Link",
    backToLogin: "Back to Login"
  }
};

function ForgotPassword({ onBackToLogin, currentLang }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ቋንቋውን ከ Setting ይቀበላል
  const lang = currentLang || localStorage.getItem('appLanguage') || 'am';
  const t = translations[lang] || translations.am;

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
        throw new Error(data.message || t.emailNotFound);
      }

      // 2. የ Reset Link ማዘጋጀት
      const resetUrl = `${window.location.origin}/reset-password/${data.resetToken}`;

      // 3. EmailJS ን በመጠቀም ኢሜይሉን ለተጠቃሚው መላክ
      const templateParams = {
        to_email: email,
        reset_url: resetUrl
      };

      await emailjs.send(
        'YOUR_SERVICE_ID',   // የ EmailJS Service ID
        'YOUR_TEMPLATE_ID',  // የ EmailJS Template ID
        templateParams,
        'YOUR_PUBLIC_KEY'    // የ EmailJS Public Key
      );

      setMessage(t.successMsg);
      setEmail('');
    } catch (err) {
      setError(err.message || t.defaultError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#eef2f5', padding: '20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px' }}>
        <h2 style={{ textAlign: 'center', color: '#0b5ed7', marginBottom: '15px', fontWeight: 'bold', fontSize: '20px' }}>
          {t.title}
        </h2>
        <p style={{ textAlign: 'center', color: '#666', fontSize: '13px', marginBottom: '20px' }}>
          {t.description}
        </p>

        {error && <div style={{ color: '#842029', backgroundColor: '#f8d7da', border: '1px solid #f5c2c7', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}
        {message && <div style={{ color: '#0f5132', backgroundColor: '#d1e7dd', border: '1px solid #badbcc', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>{t.emailLabel}</label>
            <input
              type="email"
              placeholder={t.emailPlaceholder}
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
            {loading ? t.sending : t.sendBtn}
          </button>
        </form>

        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '13px' }}>
          <span onClick={onBackToLogin} style={{ color: '#0b5ed7', cursor: 'pointer', fontWeight: 'bold' }}>
            {t.backToLogin}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;