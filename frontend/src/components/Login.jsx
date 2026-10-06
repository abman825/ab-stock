import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Dynamic multi-language translations
const translations = {
  am: {
    createAccount: "አካውንት ይፍጠሩ",
    signIn: "ይግቡ (Login)",
    resetPassword: "የይለፍ ቃል መቀየሪያ",
    yourEmail: "የኢሜይል አድራሻዎ",
    enterEmail: "ኢሜይልዎን ያስገቡ",
    username: "የተጠቃሚ ስም (Username)",
    usernameOrEmail: "የተጠቃሚ ስም ወይም ኢሜይል",
    enterUsername: "የተጠቃሚ ስም ያስገቡ",
    fullName: "ሙሉ ስም",
    enterFullName: "ሙሉ ስምዎን ያስገቡ",
    emailAddress: "የኢሜይል አድራሻ",
    password: "የይለፍ ቃል (Password)",
    enterPassword: "የይለፍ ቃል ያስገቡ",
    processing: "በማስኬድ ላይ...",
    signUpBtn: "ተመዝገብ (Sign Up)",
    signInBtn: "ግባ (Sign In)",
    sendResetBtn: "የመቀየሪያ ሊንክ ላክ",
    forgotPassword: "የይለፍ ቃል ረስተዋል?",
    noAccount: "አካውንት የለዎትም?",
    registerLink: "ተመዝገብ",
    hasAccount: "አካውንት አለዎት?",
    loginLink: "ይግቡ",
    backTo: "ወደ",
    cantSendEmail: "ኢሜይል መላክ አልተቻለም",
    resetLinkSent: "የይለፍ ቃል መቀየሪያ ሊንክ ወደ ኢሜይልዎ ተልኳል! እባክዎን ኢሜይልዎን ያረጋግጡ።",
    unknownError: "ስህተት ተፈጥሯል",
    registerSuccess: "ምዝገባው በተሳካ ሁኔታ ተጠናቋል! እባክዎን አሁን ይግቡ!"
  },
  om: {
    createAccount: "Akkaawuntii Uumi",
    signIn: "Seeni (Sign In)",
    resetPassword: "Jijjiirraa Jecha Darbiisaa",
    yourEmail: "Teessoo E-mail Keessան",
    enterEmail: "E-mail keessan galchaa",
    username: "Maqaa Fayyadamaa (Username)",
    usernameOrEmail: "Maqaa Fayyadamaa ykn E-mail",
    enterUsername: "Maqaa fayyadamaa galchaa",
    fullName: "Maqaa Guutuu",
    enterFullName: "Maqaa guutuu galchaa",
    emailAddress: "Teessoo E-mail",
    password: "Jecha Darbiisaa (Password)",
    enterPassword: "Jecha darbiisaa galchaa",
    processing: "Hojjetamaa jira...",
    signUpBtn: "Galmeessi (Sign Up)",
    signInBtn: "Seeni (Sign In)",
    sendResetBtn: "Ergaa Jijjiirraa Ergi",
    forgotPassword: "Jecha darbiisaa dagattee?",
    noAccount: "Akkaawuntii hin qabduu?",
    registerLink: "Galmeessi",
    hasAccount: "Akkaawuntii qabdaa?",
    loginLink: "Seeni",
    backTo: "Gara",
    cantSendEmail: "E-mail erguun hin danda'amne",
    resetLinkSent: "Liinkiin jecha darbiisaa jijjiiru e-mail keessaniif ergameera! Maaloo e-mail keessan checked godhaa.",
    unknownError: "Dogoggorri uumameera",
    registerSuccess: "Galmeen milkaa'inaan xumurameera! Maaloo isa booda seeni!"
  },
  en: {
    createAccount: "Create Account",
    signIn: "Sign In",
    resetPassword: "Reset Password",
    yourEmail: "Your Email",
    enterEmail: "Enter your email address",
    username: "Username",
    usernameOrEmail: "Username or Email",
    enterUsername: "Enter username",
    fullName: "Full Name",
    enterFullName: "Enter full name",
    emailAddress: "Email Address",
    password: "Password",
    enterPassword: "Enter password",
    processing: "Processing...",
    signUpBtn: "Sign Up",
    signInBtn: "Sign In",
    sendResetBtn: "Send Reset Link",
    forgotPassword: "Forgot Password?",
    noAccount: "Don't have an account?",
    registerLink: "Register",
    hasAccount: "Already have an account?",
    loginLink: "Login",
    backTo: "Back to",
    cantSendEmail: "Failed to send email",
    resetLinkSent: "Password reset link sent to your email! Please check your inbox.",
    unknownError: "An error occurred",
    registerSuccess: "Registration successful! Please sign in now."
  }
};

function Login({ onLoginSuccess, onForgotPassword }) {
  const [mode, setMode] = useState('login');
  const [lang, setLang] = useState(() => localStorage.getItem('appLanguage') || 'am');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem('appLanguage') || 'am');
    };
    window.addEventListener('storage', handleLangChange);
    window.addEventListener('languageChanged', handleLangChange);
    return () => {
      window.removeEventListener('storage', handleLangChange);
      window.removeEventListener('languageChanged', handleLangChange);
    };
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('appLanguage', newLang);
    window.dispatchEvent(new Event('languageChanged'));
  };

  const t = translations[lang] || translations.am;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (mode === 'forgot') {
      try {
        const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || t.cantSendEmail);

        setMessage(t.resetLinkSent);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    localStorage.clear();

    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const payload = mode === 'register' 
      ? formData 
      : { username: formData.username, password: formData.password };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t.unknownError);
      }

      if (mode === 'register') {
        alert(t.registerSuccess);
        setMode('login');
        setFormData({ username: '', email: '', password: '', fullName: '', phone: '' });
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotClick = () => {
    setError('');
    setMessage('');
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      setMode('forgot'); 
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#eef2f5', padding: '20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px' }}>
        
        {/* Language Switcher */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
          <select 
            value={lang} 
            onChange={(e) => changeLanguage(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px', cursor: 'pointer' }}
          >
            <option value="am">አማርኛ</option>
            <option value="om">Afaan Oromoo</option>
            <option value="en">English</option>
          </select>
        </div>

        <h2 style={{ textAlign: 'center', color: '#0b5ed7', marginBottom: '20px', fontWeight: 'bold', fontSize: '20px' }}>
          {mode === 'register' && t.createAccount}
          {mode === 'login' && t.signIn}
          {mode === 'forgot' && t.resetPassword}
        </h2>

        {error && <div style={{ color: '#842029', backgroundColor: '#f8d7da', border: '1px solid #f5c2c7', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}
        {message && <div style={{ color: '#0f5132', backgroundColor: '#d1e7dd', border: '1px solid #badbcc', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Forgot Password Mode: Email Only */}
          {mode === 'forgot' ? (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>{t.yourEmail}</label>
              <input
                type="email"
                name="email"
                placeholder={t.enterEmail}
                value={formData.email}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '4px', boxSizing: 'border-box' }}
              />
            </div>
          ) : (
            <>
              {/* Username Input */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>{t.username}</label>
                <input
                  type="text"
                  name="username"
                  placeholder={mode === 'register' ? t.enterUsername : t.usernameOrEmail}
                  value={formData.username}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '4px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Extra Register Fields */}
              {mode === 'register' && (
                <>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>{t.fullName}</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder={t.enterFullName}
                      value={formData.fullName}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '4px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>{t.emailAddress}</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="example@mail.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
                </>
              )}

              {/* Password Input */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>{t.password}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder={t.enterPassword}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '10px 35px 10px 10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '4px', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-30%)', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
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
              marginTop: '5px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? t.processing : (mode === 'register' ? t.signUpBtn : mode === 'login' ? t.signInBtn : t.sendResetBtn)}
          </button>
        </form>

        {/* Footer Links */}
        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {mode === 'login' && (
            <>
              <span
                onClick={handleForgotClick}
                style={{ color: '#0b5ed7', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
              >
                {t.forgotPassword}
              </span>
              <div>
                {t.noAccount}{' '}
                <span
                  onClick={() => { setMode('register'); setError(''); setMessage(''); }}
                  style={{ color: '#0b5ed7', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {t.registerLink}
                </span>
              </div>
            </>
          )}

          {mode === 'register' && (
            <div>
              {t.hasAccount}{' '}
              <span
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                style={{ color: '#0b5ed7', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {t.loginLink}
              </span>
            </div>
          )}

          {mode === 'forgot' && (
            <div>
              {t.backTo}{' '}
              <span
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                style={{ color: '#0b5ed7', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {t.loginLink}
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Login;