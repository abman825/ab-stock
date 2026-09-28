import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// API Base URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

function ResetPassword({ onBackToLogin }) {
  const { token: urlToken } = useParams(); // URL Params ወይም Prop ከተሰጠው ይወስዳል
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 10 ደቂቃ = 600 ሰከንድ ቆጣሪ
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

  // ሰከንድን ወደ "09:59" ፎርማት መቀየሪያ
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
      return setError('የስራኸው ፓስወርድ አያመሳስልም!');
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/reset-password/${urlToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'ስህተት ተፈጥሯል');
      }

      setMessage('ፓስወርድዎ በተሳካ ሁኔታ ተቀይሯል! አሁን መግባት ይችላሉ።');
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#eef2f5', padding: '20px' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px' }}>
        <h2 style={{ textAlign: 'center', color: '#0b5ed7', marginBottom: '15px', fontWeight: 'bold' }}>New Password</h2>

        {/* የ 10 ደቂቃ ቆጣሪ ማሳያ */}
        <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '14px' }}>
          {isExpired ? (
            <p style={{ color: '#dc3545', fontWeight: 'bold', margin: 0 }}>
              ⚠️ የሊንኩ ጊዜ (10 ደቂቃ) አልቋል! እባክዎን እንደገና ሊንክ ይጠይቁ።
            </p>
          ) : (
            <p style={{ color: '#555', margin: 0 }}>
              ⏱️ የሊንኩ ማብቂያ ጊዜ፡ <strong style={{ color: '#0b5ed7' }}>{formatTime(timeLeft)}</strong>
            </p>
          )}
        </div>

        {error && <div style={{ color: '#842029', backgroundColor: '#f8d7da', border: '1px solid #f5c2c7', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}
        {message && <div style={{ color: '#0f5132', backgroundColor: '#d1e7dd', border: '1px solid #badbcc', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isExpired}
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
            {loading ? 'Processing...' : 'Change Password'}
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

export default ResetPassword;