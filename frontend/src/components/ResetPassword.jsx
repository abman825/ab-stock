import React, { useState, useEffect } from 'react';

// Fixed API Base URL resolution
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

// Multi-language translations
const translations = {
  am: {
    title: "አዲስ የይለፍ ቃል (New Password)",
    expiredNotice: "⚠️ የሊንኩ ጊዜ (10 ደቂቃ) አልቋል! እባክዎን እንደገና ሊንክ ይጠይቁ።",
    timeRemaining: "⏱️ የሊንኩ ማብቂያ ጊዜ፦",
    newPasswordLabel: "አዲስ የይለፍ ቃል",
    newPasswordPlaceholder: "አዲስ የይለፍ ቃል ያስገቡ",
    confirmPasswordLabel: "የይለፍ ቃሉን ያረጋግጡ",
    confirmPasswordPlaceholder: "የይለፍ ቃሉን ደግመው ያስገቡ",
    mismatchError: "የይለፍ ቃሎቹ አይመሳሰሉም!",
    defaultError: "ስህተት ተፈጥሯል",
    successMsg: "የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል! አሁን መግባት ይችላሉ።",
    processing: "በማስኬድ ላይ...",
    changeBtn: "የይለፍ ቃል ቀይር",
    backToLogin: "ወደ መግቢያ ገጽ ተመለስ"
  },
  om: {
    title: "Jecha Darbiisaa Haaraa (New Password)",
    expiredNotice: "⚠️ Yeroon liinkii (daqiiqaa 10) dhumateera! Maaloo irra deebitiin liinkii gaafadhaa.",
    timeRemaining: "⏱️ Yeroo liinkii hafe:",
    newPasswordLabel: "Jecha Darbiisaa Haaraa",
    newPasswordPlaceholder: "Jecha darbiisaa haaraa galchaa",
    confirmPasswordLabel: "Jecha Darbiisaa Mirkaneessi",
    confirmPasswordPlaceholder: "Jecha darbiisaa irra deebi'ii galchaa",
    mismatchError: "Jechi darbiisaa wal hin simne!",
    defaultError: "Dogoggorri uumameera",
    successMsg: "Jechi darbiisaa keessan milkaa'inaan jijjiirameera! Amma seenuu dandeessu.",
    processing: "Hojjetamaa jira...",
    changeBtn: "Jecha Darbiisaa Jijjiiri",
    backToLogin: "Gara Seensaatti Deebi'i"
  },
  en: {
    title: "New Password",
    expiredNotice: "⚠️ Link expired (10 minutes)! Please request a new reset link.",
    timeRemaining: "⏱️ Link expires in:",
    newPasswordLabel: "New Password",
    newPasswordPlaceholder: "Enter new password",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm new password",
    mismatchError: "Passwords do not match!",
    defaultError: "An error occurred",
    successMsg: "Your password has been changed successfully! You can now log in.",
    processing: "Processing...",
    changeBtn: "Change Password",
    backToLogin: "Back to Login"
  }
};

function ResetPassword({ token, onBackToLogin, currentLang }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reba ururimi rwakoreshejwe muri Setting
  const lang = currentLang || localStorage.getItem('appLanguage') || 'am';
  const t = translations[lang] || translations.am;

  // 10 minutes = 600 seconds timer
  const [timeLeft, setTimeLeft] = useState(600);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Hindura amasegonda mu buryo bwa "09:59"
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      return setError(t.mismatchError);
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t.defaultError);
      }

      setMessage(t.successMsg);
      setTimeout(() => {
        if (onBackToLogin) onBackToLogin();
      }, 2000);

    } catch (err) {
      setError(err.message);
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

        {/* 10 minute timer */}
        <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '13px' }}>
          {isExpired ? (
            <p style={{ color: '#dc3545', fontWeight: 'bold', margin: 0 }}>
              {t.expiredNotice}
            </p>
          ) : (
            <p style={{ color: '#555', margin: 0 }}>
              {t.timeRemaining} <strong style={{ color: '#0b5ed7' }}>{formatTime(timeLeft)}</strong>
            </p>
          )}
        </div>

        {error && <div style={{ color: '#842029', backgroundColor: '#f8d7da', border: '1px solid #f5c2c7', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}
        {message && <div style={{ color: '#0f5132', backgroundColor: '#d1e7dd', border: '1px solid #badbcc', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>{t.newPasswordLabel}</label>
            <input
              type="password"
              placeholder={t.newPasswordPlaceholder}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isExpired}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>{t.confirmPasswordLabel}</label>
            <input
              type="password"
              placeholder={t.confirmPasswordPlaceholder}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isExpired}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || isExpired}
            style={{
              padding: '10px',
              background: (loading || isExpired) ? '#6c757d' : '#0b5ed7',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: (loading || isExpired) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              marginTop: '5px'
            }}
          >
            {loading ? t.processing : t.changeBtn}
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

export default ResetPassword;