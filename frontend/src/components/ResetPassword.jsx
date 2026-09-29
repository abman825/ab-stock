import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://ab-stock.onrender.com';

function ResetPassword({ onBackToLogin }) {
  // 1. Tokenኑን ከ URL ውስጥ በ useParams እንወስዳለን
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      return setError('የስራው የይለፍ ቃሎች አይመሳሰሉም!');
    }

    if (!token || token === 'undefined') {
      return setError('የሊንኩ ጊዜ አልፏል ወይም ትክክል አይደለም!');
    }

    setLoading(true);

    try {
      // 2. Tokenኑን በ URL Path ውስጥ አስተካክለን ወደ Backend እንልካለን
      const res = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'የሊንኩ ጊዜ አልፏል ወይም ትክክል አይደለም');
      }

      setMessage('የይለፍ ቃልዎ በትክክል ተቀይሯል! አሁን መግባት ይችላሉ።');
      setTimeout(() => {
        if (onBackToLogin) {
          onBackToLogin();
        } else {
          navigate('/login');
        }
      }, 2500);

    } catch (err) {
      console.error('Reset Password Error:', err);
      setError(err.message || 'የሊንኩ ጊዜ አልፏል ወይም ትክክል አይደለም');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#eef2f5', padding: '20px' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px' }}>
        
        <h2 style={{ textAlign: 'center', color: '#0b5ed7', marginBottom: '15px', fontWeight: 'bold' }}>
          New Password
        </h2>

        {error && <div style={{ color: '#842029', backgroundColor: '#f8d7da', border: '1px solid #f5c2c7', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}
        {message && <div style={{ color: '#0f5132', backgroundColor: '#d1e7dd', border: '1px solid #badbcc', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <span
            onClick={onBackToLogin || (() => navigate('/login'))}
            style={{ color: '#0b5ed7', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
          >
            Back to Login
          </span>
        </div>

      </div>
    </div>
  );
}

export default ResetPassword;