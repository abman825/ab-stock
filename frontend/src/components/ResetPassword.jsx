import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ab-stock.onrender.com';
const API_BASE_URL = `${BASE_URL}/api`;

function ResetPassword({ token: propsToken, onBackToLogin }) {
  const { token: urlToken } = useParams();
  const navigate = useNavigate();

  // በ URL ወይም በ Props የመጣውን Token መውሰድ
  const token = urlToken || propsToken;

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

    if (password.length < 6) {
      setError('የይለፍ ቃሉ ቢያንስ 6 አሃዛት መሆን አለበት!');
      return;
    }

    if (!token) {
      setError('ትክክለኛ ያልሆነ ወይም የጎደለ Token!');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'የይለፍ ቃልዎ በትክክል ተቀይሯል!');
        setTimeout(() => {
          if (onBackToLogin) {
            onBackToLogin();
          } else {
            navigate('/');
          }
        }, 3000);
      } else {
        setError(data.message || 'የሊንኩ ጊዜ አልፏል ወይም ትክክል አይደለም!');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('ከ Server ጋር መገናኘት አልተቻለም!');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#1d4ed8', marginBottom: '20px' }}>New Password</h2>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            backgroundColor: '#dcfce7',
            color: '#15803d',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '15px'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>New Password</label>
            <input
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '4px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '4px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#93c5fd' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'በመቀየር ላይ...' : 'Change Password'}
          </button>
        </form>

        <button
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            marginTop: '15px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold'
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;