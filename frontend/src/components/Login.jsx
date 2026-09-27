import React, { useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

function Login({ onLoginSuccess }) {
  // Mode States: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');
  
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

  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit Handler for Login, Register, and Forgot Password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (mode === 'forgot') {
      // Handle Forgot Password via Nodemailer Endpoint
      try {
        const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'ኢሜይል መላክ አልተቻለም');

        setMessage('የይለፍ ቃል መቀየሪያ ሊንክ ወደ ኢሜይልዎ ተልኳል! እባክዎን ኢሜይልዎን ያረጋግጡ።');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle Login & Register
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
        throw new Error(data.message || 'ስህተት ተፈጥሯል');
      }

      if (mode === 'register') {
        alert('ምዝገባው በተሳካ ሁኔታ ተጠናቋል። እባክዎን አሁን ይግቡ!');
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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#eef2f5', padding: '20px' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px' }}>
        
        <h2 style={{ textAlign: 'center', color: '#0b5ed7', marginBottom: '20px', fontWeight: 'bold' }}>
          {mode === 'register' && 'Create Account'}
          {mode === 'login' && 'Sign In'}
          {mode === 'forgot' && 'Reset Password'}
        </h2>

        {error && <div style={{ color: '#842029', backgroundColor: '#f8d7da', border: '1px solid #f5c2c7', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}
        {message && <div style={{ color: '#0f5132', backgroundColor: '#d1e7dd', border: '1px solid #badbcc', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px' }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Forgot Password Mode: Email Only */}
          {mode === 'forgot' ? (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Your Email</label>
              <input
                type="email"
                name="email"
                placeholder="enter your email address"
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
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder={mode === 'register' ? "Enter username" : "Username or Email"}
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
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '4px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Email Address</label>
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
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter password"
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
            {loading ? 'Processing...' : (mode === 'register' ? 'Sign Up' : mode === 'login' ? 'Sign In' : 'Send Reset Link')}
          </button>
        </form>

        {/* Footer Links */}
        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {mode === 'login' && (
            <>
              <span
                onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}
                style={{ color: '#0b5ed7', cursor: 'pointer', fontSize: '12px' }}
              >
                Forgot Password?
              </span>
              <div>
                Don't have an account?{' '}
                <span
                  onClick={() => { setMode('register'); setError(''); setMessage(''); }}
                  style={{ color: '#0b5ed7', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Register
                </span>
              </div>
            </>
          )}

          {mode === 'register' && (
            <div>
              Already have an account?{' '}
              <span
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                style={{ color: '#0b5ed7', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Login
              </span>
            </div>
          )}

          {mode === 'forgot' && (
            <div>
              Back to{' '}
              <span
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                style={{ color: '#0b5ed7', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Login
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Login;