import React, { useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ab-stock.onrender.com';

function ResetPassword({ onBackToLogin }) {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('የይለፍ ቃሎቹ አይመሳሰሉም!');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('የይለፍ ቃልዎ በትክክል ተቀይሯል!');
        setTimeout(() => {
          if (onBackToLogin) onBackToLogin();
        }, 2000);
      } else {
        setError(data.message || 'የተሳሳተ ኮድ ወይም የኮዱ ጊዜ አልፏል!');
      }
    } catch (err) {
      setError('ከ Server ጋር መገናኘት አልተቻለም!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
      <h2>Reset Password</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="6-Digit Code (ከኢሜይል የመጣው)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
          {loading ? 'በመቀየር ላይ...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;