import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
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
        console.error('Failed to load user profile:', err);
      }
    };

    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const res = await axios.put(
        'http://localhost:5000/api/auth/update-profile',
        profileData,
        { headers: getAuthHeaders() }
      );

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...profileData }));

    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile!'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields!' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match!' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters!' });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put(
        'http://localhost:5000/api/auth/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: getAuthHeaders() }
      );

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password! Check your current password.'
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
          Account Settings
        </h2>
        <p style={{ fontSize: '13px', color: '#6c757d', margin: 0 }}>
          Manage your account profile and security settings.
        </p>
      </div>

      <div className="settings-container">
        
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
            👤 Profile Info
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
            🔒 Password & Security
          </button>
        </div>

        <div className="settings-content">
          
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

          {activeTab === 'profile' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px', color: '#212529' }}>
                Profile Information
              </h3>
              <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '20px' }}>
                Update your personal details and contact information.
              </p>

              <form onSubmit={handleUpdateProfile}>
                <div className="form-grid-2" style={{ marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '5px' }}>
                      Username
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
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '5px' }}>
                      Email Address
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
                      Phone Number
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
                  {loading ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px', color: '#212529' }}>
                Change Password
              </h3>
              <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '20px' }}>
                Use a strong password to keep your account safe.
              </p>

              <form onSubmit={handleUpdatePassword}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '5px' }}>
                    Current Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
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
                      New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
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
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Re-enter new password"
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
                  {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
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