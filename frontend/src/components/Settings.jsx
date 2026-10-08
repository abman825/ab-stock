import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

const translations = {
  am: {
    settingsTitle: "የአካውንት ማስተካከያ (Settings)",
    settingsDesc: "የግል መረጃዎን፣ የንግድ አይነትዎን፣ የመረጃ ጥበቃን እና የደህንነት ቅንብሮችን እዚህ ያስተካክሉ።",
    profileTab: "👤 የፕሮፋይል መረጃ",
    businessTab: "🏢 የንግድ አይነት (Business Mode)",
    backupTab: "📦 የመረጃ ጥበቃ (Backup)",
    securityTab: "🔒 ፓስወርድ እና ደህንነት",
    languageTab: "🌐 ቋንቋ (Language)",
    langSelectTitle: "የመተግበሪያውን ቋንቋ ይምረጡ",
    langSelectDesc: "በሚመችዎት ቋንቋ መተግበሪያውን ይጠቀሙ።",
    username: "የተጠቃሚ ስም (Username)",
    fullName: "ሙሉ ስም (Full Name)",
    email: "ኢሜይል (Email Address)",
    phone: "ስልክ ቁጥር (Phone Number)",
    saveBtn: "ለውጦችን አስቀምጥ",
    savingBtn: "በማስቀመጥ ላይ...",
    passCurrent: "አሁን የሚጠቀሙበት ፓስወርድ",
    passNew: "አዲስ ፓስወርድ",
    passConfirm: "አዲሱን ፓስወርድ ያረጋግጡ",
    passBtn: "ፓስወርድ ቀይር",
    pharmacyTitle: "ፋርማሲ (Pharmacy / Medicine)",
    pharmacyDesc: "የመድኃኒት ማለቂያ ቀን (Expiry Date)፣ የሲሮፕ/ታብሌት አይነት እና ልዩ የመድኃኒት መግለጫዎችን ያካተተ ቅጽ።",
    buildingTitle: "ሕንፃ መሣሪያ (Building Materials)",
    buildingDesc: "የመደብ አይነት (Material Type)፣ የክፍያ/መለኪያ Unit (በካሬ፣ በሜትር፣ በኪሎ፣ በቁጥር) የሚያካተት ቅጽ።",
    backupTitle: "የመረጃ ባካፕ እና ማውረጃ (Full Data Backup)",
    backupDesc: "የምርቶችዎን፣ የደንበኞችዎን፣ የአቅራቢዎችዎን እና የሽያጭ ታሪክዎን ሙሉ በሙሉ በአንድ ፋይል አውርደው ያስቀምጡ።",
    exportBtn: "📥 ሁሉንም መረጃዎች አውርድ (Export All)",
    successProfile: "ፕሮፋይሉ በተሳካ ሁኔታ ተዘምኗል!",
    successBusiness: "የንግድ አይነት በስኬት ተቀይሯል!",
    successPass: "ፓስወርዱ በተሳካ ሁኔታ ተቀይሯል!",
    profileSubtitle: "የግል መረጃዎን እና የመገናኛ አድራሻዎን ያዘምኑ።",
    businessSubtitle: "የሚሰሩበትን የንግድ ዘርፍ ይምረጡ። በምርጫዎ መሰረት እቃዎች መመዝገቢያ እና ገጾች በራሳቸው የተቀየራሉ።",
    securitySubtitle: "አካውንትዎን ደህንነቱ የተጠበቀ ለማድረግ ጠንካራ ፓስወርድ ይጠቀሙ።",
    emptyPassErr: "እባክዎን ሁሉንም የፓስወርድ ቦታዎች ይሙሉ!",
    matchPassErr: "አዲሱ ፓስወርድ እና ማረጋገጫው አልተመሳሰሉም!",
    lenPassErr: "አዲሱ ፓስወርድ ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት!",
    failPassErr: "ፓስወርድ መቀየር አልተቻለም! አሁን የሚጠቀሙበትን ፓስወርድ ያረጋግጡ።"
  },
  om: {
    settingsTitle: "Qindaa'ina Akkaawuntii (Settings)",
    settingsDesc: "Odeeffannoo dhuunfaa, gosa daldalaa fi qindaa'ina meeshaa asitti sirreessaa.",
    profileTab: "👤 Odeeffannoo Piroofaayilii",
    businessTab: "🏢 Gosa Daldalaa (Business Mode)",
    backupTab: "📦 Backup & Qusannaa",
    securityTab: "🔒 Jecha Darbiitiifi Nageenya",
    languageTab: "🌐 Afaan (Language)",
    langSelectTitle: "Afaan fayyadamuu barbaaddan filadhaa",
    langSelectDesc: "Afaan isiniif mijaatuun sirna kana fayyadamaa.",
    username: "Maqaa Fayyadamaa (Username)",
    fullName: "Maqaa Guutuu (Full Name)",
    email: "Imeelii (Email Address)",
    phone: "Lakk. Bilbilaa (Phone Number)",
    saveBtn: "Jijjiirama Olkaa'i",
    savingBtn: "Olka'amaa jira...",
    passCurrent: "Jecha Darbii Ammaa",
    passNew: "Jecha Darbii Haaraa",
    passConfirm: "Jecha Darbii Haaraa Mirkaneessi",
    passBtn: "Jecha Darbii Jijjiiri",
    pharmacyTitle: "Faarmasii (Pharmacy / Medicine)",
    pharmacyDesc: "Guyyaa darbiinsa qorichaa, gosa sirooppii/taableetiifi ibsa qorichaa addaa kan qabate.",
    buildingTitle: "Meeshaa Ijaarsaa (Building Materials)",
    buildingDesc: "Gosa meeshaa fi safartuu (Karee, Meetrii, Kiiloo, Lakkos) kan qabate.",
    backupTitle: "Odeeffannoo Guutuu Olkaa'uu (Backup Data)",
    backupDesc: "Odeeffannoo oomishaa, maamiltootaa fi gurgurtaa guutuu gara kompiitara/bilbila keessaniitti buufadhaa.",
    exportBtn: "📥 Odeeffannoo Guutuu Buufadhu (Export All)",
    successProfile: "Piroofaayiliin milkaa'inaan haaromfameera!",
    successBusiness: "Gosi daldalaa milkaa'inaan jijjiirameera!",
    successPass: "Jechi darbii milkaa'inaan jijjiirameera!",
    profileSubtitle: "Odeeffannoo dhuunfaa fi teessoo keessan haaromsaa.",
    businessSubtitle: "Gosa daldala keessani filadhaa. Filannoo keessan irratti hundaa'uun fuulotni ni jijjiiramu.",
    securitySubtitle: "Akkaawuntii keessan eeguuf jecha darbii jabaa fayyadamaa.",
    emptyPassErr: "Maaloo iddoo jecha darbii hunda guutaa!",
    matchPassErr: "Jechi darbii haaraa fi mirkaneessan wal hin simne!",
    lenPassErr: "Jechi darbii haaraa yoo xiqqaate arfiilee/lakkoofsota 6 ta'uu qaba!",
    failPassErr: "Jecha darbii jijjiiruun hin danda'amne! Jecha darbii ammaa mirkaneessaa."
  },
  en: {
    settingsTitle: "Account Settings",
    settingsDesc: "Manage your profile details, business type, data backup, and security preferences.",
    profileTab: "👤 Profile Info",
    businessTab: "🏢 Business Mode",
    backupTab: "📦 Data Backup",
    securityTab: "🔒 Password & Security",
    languageTab: "🌐 Language Options",
    langSelectTitle: "Select Application Language",
    langSelectDesc: "Choose the language you want to use across the app.",
    username: "Username",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    saveBtn: "Save Changes",
    savingBtn: "Saving...",
    passCurrent: "Current Password",
    passNew: "New Password",
    passConfirm: "Confirm New Password",
    passBtn: "Change Password",
    pharmacyTitle: "Pharmacy / Medicine",
    pharmacyDesc: "Includes medicine expiration date (Expiry Date), syrup/tablet type and special medicine specifications.",
    buildingTitle: "Building Materials",
    buildingDesc: "Includes material classification and unit measurements (sqm, meter, kg, quantity).",
    backupTitle: "Full Data Backup & Export",
    backupDesc: "Download all your products, customers, suppliers, and sales history in one file for safe keeping.",
    exportBtn: "📥 Export All System Data",
    successProfile: "Profile updated successfully!",
    successBusiness: "Business mode updated successfully!",
    successPass: "Password changed successfully!",
    profileSubtitle: "Update your personal details and contact information.",
    businessSubtitle: "Select your business type. Pages and forms will dynamically adapt to your choice.",
    securitySubtitle: "Use a strong password to keep your account safe.",
    emptyPassErr: "Please fill in all password fields!",
    matchPassErr: "New password and confirmation do not match!",
    lenPassErr: "New password must be at least 6 characters long!",
    failPassErr: "Failed to change password! Please check your current password."
  }
};

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'am');
  const t = translations[language] || translations.am;

  const [businessType, setBusinessType] = useState(() => {
    const raw = localStorage.getItem('businessType') || 'pharmacy';
    return raw.toLowerCase().includes('building') ? 'building_materials' : 'pharmacy';
  });

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

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
    window.dispatchEvent(new Event('languageChanged'));
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: getAuthHeaders()
        });
        if (res.data) {
          const userData = res.data.user || res.data;
          setProfileData({
            username: userData.username || '',
            fullName: userData.fullName || userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            role: userData.role || 'User'
          });

          if (userData.businessType) {
            const normalizedType = userData.businessType.toLowerCase().includes('building') 
              ? 'building_materials' 
              : 'pharmacy';
            setBusinessType(normalizedType);
            localStorage.setItem('businessType', normalizedType);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchUserProfile();
  }, []);

  // 📦 Full Export Function
  const handleExportAllData = async () => {
    setExportLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/products/export-all`, {
        headers: getAuthHeaders()
      });

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ab_stock_full_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setMessage({ type: 'success', text: 'የስርዓቱ ሙሉ መረጃ በተሳካ ሁኔታ ወርዷል!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'መረጃዎችን ማውረድ አልተቻለም!' });
    } finally {
      setExportLoading(false);
    }
  };

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

      setMessage({ type: 'success', text: t.successProfile });
      const updatedUser = res.data.user || res.data;
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedUser }));
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error updating profile!'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusinessType = async (type) => {
    const normalizedType = type.toLowerCase().includes('building') ? 'building_materials' : 'pharmacy';
    setBusinessType(normalizedType);
    localStorage.setItem('businessType', normalizedType);
    window.dispatchEvent(new Event('businessTypeChanged'));

    try {
      await axios.put(
        `${API_BASE_URL}/auth/update-profile`,
        { businessType: normalizedType },
        { headers: getAuthHeaders() }
      );
      setMessage({ type: 'success', text: t.successBusiness });
    } catch (err) {
      setMessage({ type: 'success', text: t.successBusiness });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: t.emptyPassErr });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: t.matchPassErr });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: t.lenPassErr });
      return;
    }

    setLoading(true);

    try {
      await axios.put(
        `${API_BASE_URL}/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: getAuthHeaders() }
      );

      setMessage({ type: 'success', text: t.successPass });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || t.failPassErr
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '15px', backgroundColor: '#f8f9fa', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Mobile-Friendly Adaptive Styles */}
      <style>{`
        .settings-container { display: flex; gap: 20px; max-width: 1100px; margin: 0 auto; }
        .settings-sidebar { width: 240px; display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
        .settings-content { flex: 1; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e9ecef; }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .tab-button { width: 100%; padding: 12px 14px; text-align: left; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s ease; }
        .mode-card { border: 2px solid #e9ecef; border-radius: 10px; padding: 15px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 15px; }
        .mode-card.active { border-color: #0d6efd; background-color: #f0f7ff; }
        .lang-card { border: 2px solid #e9ecef; border-radius: 10px; padding: 12px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s ease; }
        .lang-card.active { border-color: #198754; background-color: #f0fff4; }
        
        /* 📱 Mobile Specific Styles */
        @media (max-width: 768px) {
          .settings-container { flex-direction: column; }
          .settings-sidebar { width: 100%; flex-direction: row; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
          .settings-sidebar::-webkit-scrollbar { display: none; }
          .tab-button { text-align: center; white-space: nowrap; padding: 10px 14px; font-size: 12px; }
          .form-grid-2 { grid-template-columns: 1fr; }
          .settings-content { padding: 15px; }
        }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto 15px auto' }}>
        <h2 style={{ fontSize: '20px', color: '#212529', margin: '0 0 4px 0', fontWeight: '700' }}>
          {t.settingsTitle}
        </h2>
        <p style={{ fontSize: '12px', color: '#6c757d', margin: 0 }}>
          {t.settingsDesc}
        </p>
      </div>

      <div className="settings-container">
        
        {/* Sidebar Tabs */}
        <div className="settings-sidebar">
          {['profile', 'businessMode', 'backup', 'language', 'security'].map((tab) => (
            <button
              key={tab}
              className="tab-button"
              onClick={() => { setActiveTab(tab); setMessage({ type: '', text: '' }); }}
              style={{
                backgroundColor: activeTab === tab ? '#0d6efd' : '#ffffff',
                color: activeTab === tab ? '#ffffff' : '#495057',
                boxShadow: activeTab === tab ? '0 2px 6px rgba(13,110,253,0.3)' : 'none',
                border: activeTab === tab ? 'none' : '1px solid #dee2e6'
              }}
            >
              {t[`${tab}Tab`]}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="settings-content">
          
          {message.text && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '6px',
              marginBottom: '15px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: message.type === 'success' ? '#d1e7dd' : '#f8d7da',
              color: message.type === 'success' ? '#0f5132' : '#842029',
              border: `1px solid ${message.type === 'success' ? '#badbcc' : '#f5c2c7'}`
            }}>
              {message.type === 'success' ? '✅ ' : '⚠️ '}{message.text}
            </div>
          )}

          {/* 1. Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px', color: '#212529' }}>{t.profileTab}</h3>
              <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '15px' }}>{t.profileSubtitle}</p>

              <form onSubmit={handleUpdateProfile}>
                <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#495057', marginBottom: '4px' }}>{t.username}</label>
                    <input type="text" value={profileData.username} onChange={(e) => setProfileData({ ...profileData, username: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#495057', marginBottom: '4px' }}>{t.fullName}</label>
                    <input type="text" value={profileData.fullName} onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#495057', marginBottom: '4px' }}>{t.email}</label>
                    <input type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#495057', marginBottom: '4px' }}>{t.phone}</label>
                    <input type="text" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{ backgroundColor: '#0d6efd', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? t.savingBtn : t.saveBtn}
                </button>
              </form>
            </div>
          )}

          {/* 2. Business Mode Tab */}
          {activeTab === 'businessMode' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px', color: '#212529' }}>{t.businessTab}</h3>
              <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '15px' }}>{t.businessSubtitle}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className={`mode-card ${businessType === 'pharmacy' ? 'active' : ''}`} onClick={() => handleSaveBusinessType('pharmacy')}>
                  <span style={{ fontSize: '24px' }}>💊</span>
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', color: '#212529' }}>{t.pharmacyTitle}</h4>
                    <p style={{ margin: 0, fontSize: '11px', color: '#6c757d' }}>{t.pharmacyDesc}</p>
                  </div>
                </div>

                <div className={`mode-card ${businessType === 'building_materials' ? 'active' : ''}`} onClick={() => handleSaveBusinessType('building_materials')}>
                  <span style={{ fontSize: '24px' }}>🏗️</span>
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', color: '#212529' }}>{t.buildingTitle}</h4>
                    <p style={{ margin: 0, fontSize: '11px', color: '#6c757d' }}>{t.buildingDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📦 3. Data Backup Tab (የተጨመረ) */}
          {activeTab === 'backup' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px', color: '#212529' }}>{t.backupTitle}</h3>
              <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '20px' }}>{t.backupDesc}</p>

              <div style={{ background: '#f8f9fa', border: '1px dashed #0d6efd', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>📁</span>
                <button
                  onClick={handleExportAllData}
                  disabled={exportLoading}
                  style={{
                    backgroundColor: '#0d6efd',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: exportLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {exportLoading ? 'በማውረድ ላይ...' : t.exportBtn}
                </button>
              </div>
            </div>
          )}

          {/* 4. Language Tab */}
          {activeTab === 'language' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px', color: '#212529' }}>{t.langSelectTitle}</h3>
              <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '15px' }}>{t.langSelectDesc}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className={`lang-card ${language === 'am' ? 'active' : ''}`} onClick={() => handleLanguageChange('am')}>
                  <span style={{ fontWeight: '600', fontSize: '13px' }}>🇪🇹 አማርኛ (Amharic)</span>
                  {language === 'am' && <span style={{ color: '#198754', fontWeight: 'bold' }}>✔</span>}
                </div>
                <div className={`lang-card ${language === 'om' ? 'active' : ''}`} onClick={() => handleLanguageChange('om')}>
                  <span style={{ fontWeight: '600', fontSize: '13px' }}>🇪🇹 Afaan Oromoo (Oromo)</span>
                  {language === 'om' && <span style={{ color: '#198754', fontWeight: 'bold' }}>✔</span>}
                </div>
                <div className={`lang-card ${language === 'en' ? 'active' : ''}`} onClick={() => handleLanguageChange('en')}>
                  <span style={{ fontWeight: '600', fontSize: '13px' }}>🇬🇧 English</span>
                  {language === 'en' && <span style={{ color: '#198754', fontWeight: 'bold' }}>✔</span>}
                </div>
              </div>
            </div>
          )}

          {/* 5. Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px', color: '#212529' }}>{t.securityTab}</h3>
              <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '15px' }}>{t.securitySubtitle}</p>

              <form onSubmit={handleUpdatePassword}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#495057', marginBottom: '4px' }}>{t.passCurrent}</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showCurrentPassword ? 'text' : 'password'} value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} style={{ width: '100%', padding: '8px 35px 8px 10px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                      {showCurrentPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#495057', marginBottom: '4px' }}>{t.passNew}</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showNewPassword ? 'text' : 'password'} value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} style={{ width: '100%', padding: '8px 35px 8px 10px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                        {showNewPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#495057', marginBottom: '4px' }}>{t.passConfirm}</label>
                    <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{ backgroundColor: '#198754', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {t.passBtn}
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