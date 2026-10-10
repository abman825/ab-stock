import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

const translations = {
  am: {
    settingsTitle: "የአካውንት ማስተካከያ (Settings)",
    settingsDesc: "የግል መረጃዎችን፣ የንግድ አይነቶችን፣ የመረጃ ጥንቃቄ እና የደህንነት ቅንብሮችን እዚህ ያስተካክሉ።",
    profileTab: "👤 የፕሮፋይል መረጃ",
    businessTab: "🏢 የንግድ አይነት (Business Mode)",
    backupTab: "📦 የመረጃ ጥንቃቄ (Data Backup)",
    securityTab: "🔒 ምስጢር እና ደህንነት",
    languageTab: "🌐 ቋንቋ (Language)",
    langSelectTitle: "የመተግበሪያውን ቋንቋ ይምረጡ",
    langSelectDesc: "በሚቀጥሉት ቋንቋዎች መተግበሪያውን ይጠቀሙ።",
    username: "የተጠቃሚ ስም (Username)",
    fullName: "ሙሉ ስም (Full Name)",
    email: "ኢሜይል (Email Address)",
    phone: "ስልክ ቁጥር (Phone Number)",
    role: "ድረሻ (Role)",
    saveBtn: "ለውጦች ማስተካከያ",
    savingBtn: "በማስተካከል ላይ...",
    passCurrent: "አሁን የሚጠቀሙበት ምስጢር",
    passNew: "አዲስ ምስጢር",
    passConfirm: "አዲሱን ምስጢር ማረጋገጫ",
    passBtn: "ምስጢር ቀይር",
    pharmacyTitle: "ፋርማሲ (Pharmacy / Medicine)",
    pharmacyDesc: "የመድኃኒት ማለፊያ ቀን (Expiry Date)፣ የሲሮፕ/ታብሌት አይነት እና ልዩ የመድኃኒት መግለጫዎችን የሚያካተት ቅጽ።",
    buildingTitle: "ሕንፃ መሣሪያ (Building Materials)",
    buildingDesc: "የቁሳቁስ አይነት እና የማካፍ/መለኪያ Unit (በካሬ፣ በሜትር፣ በኪሎ፣ በቁጥር) የሚያካተት ቅጽ።",
    backupTitle: "የመረጃ ባክአፕ እና ማደስ (Full Data Backup & Restore)",
    backupDesc: "የምርቶችዎን፣ የደንበኞችዎን፣ የአቅራቢዎቻችንን እና የሽያጭ ታሪኮቻችንን ሙሉ በሙሉ በአንድ ፋይል አውርዶ ማስቀመጥ ወይም የነበረውን መመለስ።",
    exportBtn: "📥 ሁሉንም መረጃዎች አውርድ (Export All)",
    importBtn: "📤 መረጃዎችን ይመለሱ (Import Backup)",
    importingBtn: "በማስገባት ላይ...",
    successProfile: "ፕሮፋይሉ በሳካ ሁኔታ ተስተካክሏል!",
    successBusiness: "የንግድ አይነት በሳካ ሁኔታ ተቀባይቷል!",
    successPass: "ምስጢሩ በሳካ ሁኔታ ተቀባይቷል!",
    profileSubtitle: "የግል መረጃዎችን እና የመገናኛ አድራሻዎችን ይያዙ።",
    businessSubtitle: "የሚሰሩበትን የንግድ ስንጥ ይምረጡ። በመምረጫው መሰረት እቅዶች መመዝገቢያ እና ዎች በማዕረጋቸው ተቀናብረዋል።",
    securitySubtitle: "አካውንቱ ደህንነቱ የተጠበቀ ለማድረግ ጠንካራ ምስጢር ይጠቀሙ።",
    emptyPassErr: "እባክዎ ሁለቱም የምስጢር ቦታዎች ይሙሉ!",
    matchPassErr: "አዲስ ምስጢር እና ማረጋገጫው አልተሳሰሩም!",
    lenPassErr: "አዲስ ምስጢር ቢያንስ 6 ቃላት/ቁጥሮች መሆን አለበት!",
    failPassErr: "ምስጢር መቅየር አልተቻለም! አሁን የሚጠቀሙበትን ምስጢር ማረጋገጫ።"
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
    role: "Gahee (Role)",
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
    importBtn: "📤 Odeeffannoo Deebisi (Import Backup)",
    importingBtn: "Fe'amaa jira...",
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
    role: "Role",
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
    backupTitle: "Full Data Backup & Restore",
    backupDesc: "Download all your products, customers, suppliers, and sales history in one file for safe keeping or restore them.",
    exportBtn: "📥 Export All System Data",
    importBtn: "📤 Restore / Import Backup",
    importingBtn: "Importing...",
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
  // Accordion state: openSection walla null so alla ko udditii
  const [openSection, setOpenSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('appLanguage') || 'am';
  });

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

  const toggleSection = (sectionName) => {
    setMessage({ type: '', text: '' });
    if (openSection === sectionName) {
      setOpenSection(null);
    } else {
      setOpenSection(sectionName);
    }
  };

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

  const handleExportAllData = async () => {
    setExportLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.get(`${API_BASE_URL}/products/export-all?businessType=${businessType}`, {
        headers: getAuthHeaders()
      });

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ab_stock_${businessType}_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setMessage({ type: 'success', text: `የ${businessType === 'pharmacy' ? 'ፋርማሲ' : 'ሕንፃ መሣሪያ'} ሙሉ መረጃ በሳካ ሁኔታ ወርዷል!` });
    } catch (err) {
      setMessage({ type: 'error', text: 'መረጃዎችን ማውረድ አልተቻለም!' });
    } finally {
      setExportLoading(false);
    }
  };

  const handleImportAllData = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];

    if (!file) return;

    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = async (event) => {
      setImportLoading(true);
      setMessage({ type: '', text: '' });
      try {
        const parsedData = JSON.parse(event.target.result);
        
        await axios.post(
          `${API_BASE_URL}/products/import-all`,
          { ...parsedData, businessType },
          { headers: getAuthHeaders() }
        );

        setMessage({ type: 'success', text: 'መረጃዎች በሳካ ሁኔታ ወደ ሰርቨር ተመልሰዋል!' });
      } catch (err) {
        setMessage({ type: 'error', text: 'የፋይል መረጃውን ማስተጓጎል አልተቻለም! እባክዎ ትክክለኛ የ JSON ፋይል ይምረጡ።' });
      } finally {
        setImportLoading(false);
      }
    };
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
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, businessType: normalizedType }));

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
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
      
      <style>{`
        .accordion-container { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
        .accordion-item { background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.03); }
        .accordion-header { width: 100%; padding: 16px 20px; text-align: left; background: #ffffff; border: none; font-size: 15px; font-weight: 600; color: #212529; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: background 0.2s; }
        .accordion-header:hover { background: #f1f3f5; }
        .accordion-body { padding: 20px; border-top: 1px solid #e9ecef; background: #ffffff; }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .mode-card { border: 2px solid #e9ecef; border-radius: 10px; padding: 15px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 15px; }
        .mode-card.active { border-color: #0d6efd; background-color: #f0f7ff; }
        .lang-card { border: 2px solid #e9ecef; border-radius: 10px; padding: 12px 18px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s ease; }
        .lang-card.active { border-color: #198754; background-color: #f0fff4; }
        @media (max-width: 768px) {
          .form-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ maxWidth: '800px', margin: '0 auto 20px auto' }}>
        <h2 style={{ fontSize: '22px', color: '#212529', margin: '0 0 5px 0', fontWeight: '700' }}>
          {t.settingsTitle}
        </h2>
        <p style={{ fontSize: '13px', color: '#6c757d', margin: 0 }}>
          {t.settingsDesc}
        </p>
      </div>

      <div className="accordion-container">

        {message.text && (
          <div
            style={{
              padding: '12px 15px',
              borderRadius: '6px',
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

        {/* 1. Profile Accordion */}
        <div className="accordion-item">
          <button className="accordion-header" onClick={() => toggleSection('profile')}>
            <span>{t.profileTab}</span>
            <span>{openSection === 'profile' ? '▲' : '▼'}</span>
          </button>
          {openSection === 'profile' && (
            <div className="accordion-body">
              <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '20px' }}>
                {t.profileSubtitle}
              </p>
              <form onSubmit={handleUpdateProfile}>
                <div className="form-grid-2" style={{ marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '5px' }}>
                      {t.username}
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
                      {t.fullName}
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '5px' }}>
                      {t.email}
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '5px' }}>
                      {t.phone}
                    </label>
                    <input
                      type="text"
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
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? t.savingBtn : t.saveBtn}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 2. Business Mode Accordion */}
        <div className="accordion-item">
          <button className="accordion-header" onClick={() => toggleSection('businessMode')}>
            <span>{t.businessTab}</span>
            <span>{openSection === 'businessMode' ? '▲' : '▼'}</span>
          </button>
          {openSection === 'businessMode' && (
            <div className="accordion-body">
              <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '20px' }}>
                {t.businessSubtitle}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  className={`mode-card ${businessType === 'pharmacy' ? 'active' : ''}`}
                  onClick={() => handleSaveBusinessType('pharmacy')}
                >
                  <span style={{ fontSize: '24px' }}>💊</span>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#212529' }}>
                      {t.pharmacyTitle}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6c757d' }}>
                      {t.pharmacyDesc}
                    </p>
                  </div>
                </div>

                <div
                  className={`mode-card ${businessType === 'building_materials' ? 'active' : ''}`}
                  onClick={() => handleSaveBusinessType('building_materials')}
                >
                  <span style={{ fontSize: '24px' }}>🏗️</span>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#212529' }}>
                      {t.buildingTitle}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6c757d' }}>
                      {t.buildingDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Backup Accordion */}
        <div className="accordion-item">
          <button className="accordion-header" onClick={() => toggleSection('backup')}>
            <span>{t.backupTab}</span>
            <span>{openSection === 'backup' ? '▲' : '▼'}</span>
          </button>
          {openSection === 'backup' && (
            <div className="accordion-body">
              <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '20px' }}>
                {t.backupDesc}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#212529' }}>1. የመረጃ ባክአፕ አውርድ (Export Data)</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6c757d' }}>
                      የ{businessType === 'pharmacy' ? 'ፋርማሲ' : 'ሕንፃ መሣሪያ'} መረጃዎችን ይውረዱ።
                    </p>
                  </div>
                  <button
                    onClick={handleExportAllData}
                    disabled={exportLoading}
                    style={{
                      backgroundColor: '#0d6efd',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: exportLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {exportLoading ? 'በማውረድ ላይ...' : t.exportBtn}
                  </button>
                </div>

                <div style={{ background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#212529' }}>2. የወረደ መረጃ ይመልሱ (Import / Restore)</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6c757d' }}>
                      የ JSON ባክአፕ ፋይል በመምረጥ ይጫኑ።
                    </p>
                  </div>
                  <label style={{
                    backgroundColor: '#198754',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: importLoading ? 'not-allowed' : 'pointer',
                    display: 'inline-block'
                  }}>
                    {importLoading ? t.importingBtn : t.importBtn}
                    <input type="file" accept=".json" onChange={handleImportAllData} disabled={importLoading} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Language Accordion */}
        <div className="accordion-item">
          <button className="accordion-header" onClick={() => toggleSection('language')}>
            <span>{t.languageTab}</span>
            <span>{openSection === 'language' ? '▲' : '▼'}</span>
          </button>
          {openSection === 'language' && (
            <div className="accordion-body">
              <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '15px' }}>
                {t.langSelectDesc}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  className={`lang-card ${language === 'am' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('am')}
                >
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>🇪🇹 አማርኛ (Amharic)</span>
                  {language === 'am' && <span style={{ color: '#198754', fontWeight: 'bold' }}>✔</span>}
                </div>
                <div
                  className={`lang-card ${language === 'om' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('om')}
                >
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>🇪🇹 Afaan Oromoo (Oromo)</span>
                  {language === 'om' && <span style={{ color: '#198754', fontWeight: 'bold' }}>✔</span>}
                </div>
                <div
                  className={`lang-card ${language === 'en' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('en')}
                >
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>🇬🇧 English</span>
                  {language === 'en' && <span style={{ color: '#198754', fontWeight: 'bold' }}>✔</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Security Accordion */}
        <div className="accordion-item">
          <button className="accordion-header" onClick={() => toggleSection('security')}>
            <span>{t.securityTab}</span>
            <span>{openSection === 'security' ? '▲' : '▼'}</span>
          </button>
          {openSection === 'security' && (
            <div className="accordion-body">
              <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '20px' }}>
                {t.securitySubtitle}
              </p>
              <form onSubmit={handleUpdatePassword}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '5px' }}>
                    {t.passCurrent}
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-grid-2" style={{ marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '5px' }}>
                      {t.passNew}
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#495057', marginBottom: '5px' }}>
                      {t.passConfirm}
                    </label>
                    <input
                      type="password"
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
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? t.savingBtn : t.passBtn}
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