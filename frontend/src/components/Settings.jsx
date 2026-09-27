import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API Base URL ቅንብር
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    role: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  // የፕሮፋይል መረጃን ከባክኤንድ የመቀበል ሥራ
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: getAuthHeaders()
        });
        if (res.data) {
          setProfileData({
            username: res.data.username || '',
            fullName: res.data.fullName || res.data.name || '',
            email: res.data.email || '',
            phone: res.data.phone || '',
            role: res.data.role || 'User'
          });
        }
      } catch (err) {
        console.error('የተጠቃሚ መረጃን መጫን አልተቻለም:', err);
      }
    };

    fetchUserProfile();
  }, []);

  // የፕሮፋይል መረጃ ማዘመኛ
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const res = await axios.put(
        `${API_BASE_URL}/auth/update-profile`,
        profileData,
        { headers: getAuthHeaders() }
      );

      setMessage({ type: 'success', text: 'ፕሮፋይልዎ በተሳካ ሁኔታ ተዘምኗል!' });
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...profileData }));

    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'ፕሮፋይል ማዘመን አልተቻለም!'
      });
    } finally {
      setLoading(false);
    }
  };

  // የይለፍ ቃል (Password) መቀየሪያ
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'እባክዎን ሁሉንም የፓስወርድ ቦታዎች ይሙሉ!' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'አዲሱ ፓስወርድ እና ማረጋገጫው አይመሳሰሉም!' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'አዲሱ ፓስወርድ ቢያንስ 6 ቁምፊዎች (Characters) መሆን አለበት!' });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put(
        `${API_BASE_URL}/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: getAuthHeaders() }
      );

      setMessage({ type: 'success', text: 'ፓስወርድዎ በተሳካ ሁኔታ ተቀይሯል!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'ፓስወርድ መቀየር አልተቻለም! አሁን የሚጠቀሙበትን ፓስወርድ ያረጋግጡ።'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
      
      <style>{`
        .settings-container {
          display: flex;
          gap: 25px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .settings-sidebar {
          width: 220px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .settings-content {
          flex: 1;
          background-color: #ffffff;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #e9ecef;
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .tab-button {
          width: 100%;
          padding: 12px 16px;
          text-align: left;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        @media (max-width: 768px) {
          .settings-container {
            flex-direction: column;
          }
          .settings-sidebar {
            width: 100%;
            flex-direction: row;
            overflow-x: auto;
          }
          .tab-button {
            text-align: center;
            white-space: nowrap;
          }
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto 20px auto' }}>
        <h2 style={{ fontSize: '22px', color: '#212529', margin: '0 0 5px 0', fontWeight: '700' }}>
          የአካውንት ማስተካከያ (Account Settings)
        </h2>
        <p style={{ fontSize: '13px', color: '#6c757d', margin: 0 }}>
          የግል መረጃዎን እና የደህንነት ቅንብሮችን እዚህ ያስተካክሉ።
        </p>
      </div>

      <div className="settings-container">
        
        {/* የጎን ታብ ማውጫ (Sidebar Tabs) */}
        <div className="settings-sidebar">
          <button
            className="tab-button"
            onClick={() => { setActiveTab('profile'); setMessage({ type: '', text: '' }); }}
            style={{
              backgroundColor: activeTab === 'profile' ? '#0d6efd' : '#ffffff',
              color: activeTab === 'profile' ? '#ffffff' : '#495057',
              boxShadow: activeTab === 'profile' ? '0 2px 6px rgba(13,110,253,0.3)' : 'none',
              border: activeTab === 'profile' ? 'none' : '1px solid #dee2e6'
            }}
          >
            👤 የፕሮፋይል መረጃ
          </button>

          <button
            className="tab-button"
            onClick={() => { setActiveTab('security'); setMessage({ type: '', text: '' }); }}
            style={{
              backgroundColor: activeTab === 'security' ? '#0d6efd' : '#ffffff',
              color: activeTab === 'security' ? '#ffffff' : '#495057',
              boxShadow: activeTab === 'security' ? '0 2px 6px rgba(13,110,253,0.3)' : 'none',
              border: activeTab === 'security' ? 'none' : '1px solid #dee2e6'
            }}
          >
            🔒 ፓስወርድ እና ደህንነት
          </button>
        </div>

        {/* የዋናው ይዘት ቦታ (Main Content Area) */}
        <div className="settings-content">
          
          {/* የስኬት ወይም የስህተት መልዕክት ማሳያ */}
          {message.text && (
            <div
              style={{
                padding: '12px 15px',
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: message.type === 'success' ? '#d1e7dd' : '#f8d7da',
                color: message.type === 'success' ? '#0f5132' : '#842029',
                border: `1px solid ${message.type === 'success' ? '#badbcc' : '#f5c2c7'}`
              }}
            >
              {message.type === 'success' ? '✅ ' : '⚠️ '}
              {message.text}
            </div>
          )}

          {/* 1. የፕሮፋይል መረጃ ታብ */}
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px', color: '#212529' }}>
                የፕሮፋይል መረጃ (Profile Information)
              </h3>
              <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '20px' }}>
                የግል መረጃዎን እና የመገናኛ አድራሻዎን ያዘምኑ።
              </p>

              <form onSubmit={handleUpdateProfile}>
                <div className="form-grid-2" style={{ marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '5px' }}>
                      የተጠቃሚ ስም (Username)
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '5px' }}>
                      ሙሉ ስም (Full Name)
                    </label>
                    <input
                      type="text"
                      placeholder="ሙሉ ስም ያስገቡ"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '5px' }}>
                      ኢሜይል (Email Address)
                    </label>
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '5px' }}>
                      ስልክ ቁጥር (Phone Number)
                    </label>
                    <input
                      type="text"
                      placeholder="+251 ..."
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#0d6efd',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'በማስቀመጥ ላይ...' : 'ለወጦችን አስቀምጥ'}
                </button>
              </form>
            </div>
          )}

          {/* 2. የፓስወርድ እና ደህንነት ታብ */}
          {activeTab === 'security' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px', color: '#212529' }}>
                ፓስወርድ መቀየር (Change Password)
              </h3>
              <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '20px' }}>
                አካውንትዎን ደህንነቱ የተጠበቀ ለማድረግ ጠንካራ ፓስወርድ ይጠቀሙ።
              </p>

              <form onSubmit={handleUpdatePassword}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '5px' }}>
                    አሁን የሚጠቀሙበት ፓስወርድ
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="የአሁኑን ፓስወርድ ያስገቡ"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      style={{ width: '100%', padding: '9px 40px 9px 12px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px' }}
                    >
                      {showCurrentPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '5px' }}>
                      አዲስ ፓስወርድ
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="አዲስ ፓስወርድ ያስገቡ"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        style={{ width: '100%', padding: '9px 40px 9px 12px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px' }}
                      >
                        {showNewPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '5px' }}>
                      አዲሱን ፓስወርድ ያረጋግጡ
                    </label>
                    <input
                      type="password"
                      placeholder="አዲሱን ፓስወርድ ድጋሚ ያስገቡ"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#198754',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'በመቀየር ላይ...' : 'ፓስወርድ ቀይር'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Settings;