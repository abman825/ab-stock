import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API Base URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

// 3ቱ ቋንቋዎች የትርጉም መዝገብ (Translations)
const translations = {
  am: {
    loading: "⏳ መረጃው እየተጫነ ነው...",
    pageTitle: "📊 የሽያጭ እና የትርፍ ሪፖርት",
    pageDesc: "የንግድ እንቅስቃሴዎን፣ አጠቃላይ ሽያጭዎን እና ትርፍዎን እዚህ ይከታተሉ።",
    pharmacyBadge: "💊 የፋርማሲ ሁነታ",
    buildingBadge: "🏗️ የሕንፃ መሣሪያ ሁነታ",
    daily: "የዛሬ (Daily)",
    weekly: "የዚህ ሳምንት",
    monthly: "የዚህ ወር",
    yearly: "የዚህ ዓመት",
    sales: "ሽያጭ",
    profit: "ትርፍ",
    loss: "ከሰራ",
    totalSales: "የሁልጊዜ አጠቃላይ ሽያጭ",
    totalProfit: "አጠቃላይ ትርፍ",
    totalLoss: "አጠቃላይ ከሰራ",
    birr: "ብር"
  },
  om: {
    loading: "⏳ Odeeffannoon fe'amaa jira...",
    pageTitle: "📊 Gabaasa Gurgurtaa fi Bu'aa",
    pageDesc: "Sochii dorgommii keessani, gurgurtaa waliigalaa fi bu'aa keessan asitti hordofaa.",
    pharmacyBadge: "💊 Haala Faarmaasii",
    buildingBadge: "🏗️ Haala Meeshaa Ijaarsaa",
    daily: "Kan Har'aa",
    weekly: "Torban Kana",
    monthly: "Ji'a Kana",
    yearly: "Ayyana Kana",
    sales: "Gurgurtaa",
    profit: "Bu'aa",
    loss: "Kasaaraa",
    totalSales: "Gurgurtaa Waliigalaa",
    totalProfit: "Bu'aa Waliigalaa",
    totalLoss: "Kasaaraa Waliigalaa",
    birr: "Birr"
  },
  en: {
    loading: "⏳ Loading analytics data...",
    pageTitle: "📊 Sales & Profit Reports",
    pageDesc: "Track your business performance, overall sales, and net profit margins here.",
    pharmacyBadge: "💊 Pharmacy Mode",
    buildingBadge: "🏗️ Building Materials Mode",
    daily: "Today (Daily)",
    weekly: "This Week",
    monthly: "This Month",
    yearly: "This Year",
    sales: "Sales",
    profit: "Profit",
    loss: "Loss",
    totalSales: "All-Time Total Sales",
    totalProfit: "Total Profit",
    totalLoss: "Total Loss",
    birr: "Birr"
  }
};

function ReportsPage() {
  // Multi-language state
  const [lang, setLang] = useState(() => localStorage.getItem('appLanguage') || 'am');
  const t = translations[lang] || translations.am;

  const [stats, setStats] = useState({
    dailySales: 0,
    dailyProfit: 0,
    weeklySales: 0,
    weeklyProfit: 0,
    monthlySales: 0,
    monthlyProfit: 0,
    yearlySales: 0,
    yearlyProfit: 0,
    totalSales: 0,
    totalProfit: 0
  });
  const [loading, setLoading] = useState(true);

  // Business Type Checker
  const getSelectedBusinessType = () => {
    const rawType = localStorage.getItem('businessType') || 'pharmacy';
    const isBuildingMode = rawType.toLowerCase().includes('building');
    return isBuildingMode ? 'building_materials' : 'pharmacy';
  };

  const isBuilding = getSelectedBusinessType() === 'building_materials';

  // Authorization Header
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  // Fetch Analytics Function
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const currentBusinessType = getSelectedBusinessType();
      
      const res = await axios.get(
        `${API_BASE_URL}/reports/analytics?businessType=${currentBusinessType}`, 
        { headers: getAuthHeaders() }
      );
      
      if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Mode Switch & Language Change listeners
    const handleModeChange = () => fetchAnalytics();
    const handleLangChange = () => {
      const savedLang = localStorage.getItem('appLanguage') || 'am';
      setLang(savedLang);
    };

    window.addEventListener('storage', handleModeChange);
    window.addEventListener('storage', handleLangChange);
    window.addEventListener('businessTypeChanged', handleModeChange);
    window.addEventListener('languageChanged', handleLangChange);

    return () => {
      window.removeEventListener('storage', handleModeChange);
      window.removeEventListener('storage', handleLangChange);
      window.removeEventListener('businessTypeChanged', handleModeChange);
      window.removeEventListener('languageChanged', handleLangChange);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '300px', 
        color: '#64748b', 
        fontSize: '16px',
        fontWeight: '500',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {t.loading}
      </div>
    );
  }

  // Cards Data Configuration
  const cardsData = [
    {
      title: t.daily,
      sales: stats.dailySales,
      profit: stats.dailyProfit,
      icon: '📅',
      accentColor: '#2563eb'
    },
    {
      title: t.weekly,
      sales: stats.weeklySales,
      profit: stats.weeklyProfit,
      icon: '📊',
      accentColor: '#7c3aed'
    },
    {
      title: t.monthly,
      sales: stats.monthlySales,
      profit: stats.monthlyProfit,
      icon: '🗓️',
      accentColor: '#0891b2'
    },
    {
      title: t.yearly,
      sales: stats.yearlySales,
      profit: stats.yearlyProfit,
      icon: '📈',
      accentColor: '#ea580c'
    }
  ];

  return (
    <div style={{ 
      padding: 'clamp(15px, 3vw, 30px)', 
      flex: 1, 
      background: '#f8fafc', 
      minHeight: '100vh',
      boxSizing: 'border-box',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      
      {/* Header Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ 
            margin: 0, 
            color: '#0f172a', 
            fontSize: 'clamp(18px, 4vw, 24px)', 
            fontWeight: '700', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
          }}>
            {t.pageTitle}
          </h2>
          <span style={{ fontSize: '12px', background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '15px', fontWeight: '600' }}>
            {isBuilding ? t.buildingBadge : t.pharmacyBadge}
          </span>
        </div>
        <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
          {t.pageDesc}
        </p>
      </div>

      {/* Grid Layout - Mobile Responsive */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))', 
        gap: '16px',
        marginBottom: '20px'
      }}>
        {cardsData.map((card, index) => {
          const isNegative = (card.profit || 0) < 0;
          return (
            <div 
              key={index}
              style={{
                background: '#ffffff',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
              }}
            >
              {/* Top Accent Line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: card.accentColor
              }} />

              {/* Title & Icon */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{card.title}</span>
                <span style={{ fontSize: '18px', background: '#f1f5f9', padding: '5px 8px', borderRadius: '8px' }}>{card.icon}</span>
              </div>

              {/* Sales Amount */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.sales}</div>
                <h3 style={{ margin: '2px 0 0 0', color: '#0f172a', fontSize: 'clamp(18px, 3.5vw, 22px)', fontWeight: '700' }}>
                  {(card.sales || 0).toLocaleString()} <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748b' }}>{t.birr}</span>
                </h3>
              </div>

              {/* Profit / Loss Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: isNegative ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${isNegative ? '#fecaca' : '#bbf7d0'}`
              }}>
                <span style={{ fontSize: '12px', color: isNegative ? '#991b1b' : '#166534', fontWeight: '600' }}>
                  {isNegative ? `📉 ${t.loss}` : `📈 ${t.profit}`}
                </span>
                <span style={{ fontSize: '12px', color: isNegative ? '#dc2626' : '#16a34a', fontWeight: '700' }}>
                  {(card.profit || 0).toLocaleString()} {t.birr}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Featured Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: 'clamp(16px, 3vw, 24px)',
        borderRadius: '14px',
        color: '#ffffff',
        boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0
          }}>
            💰
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
              {t.totalSales}
            </span>
            <h3 style={{ margin: '2px 0 0 0', fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: '700', color: '#f8fafc' }}>
              {(stats.totalSales || 0).toLocaleString()} <span style={{ fontSize: '14px', color: '#94a3b8' }}>{t.birr}</span>
            </h3>
          </div>
        </div>

        <div style={{
          background: stats.totalProfit < 0 ? 'rgba(220, 38, 38, 0.2)' : 'rgba(22, 163, 74, 0.2)',
          border: `1px solid ${stats.totalProfit < 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
          padding: '10px 16px',
          borderRadius: '10px',
          textAlign: 'left',
          minWidth: '140px',
          flexGrow: 0
        }}>
          <div style={{ fontSize: '11px', color: stats.totalProfit < 0 ? '#fca5a5' : '#86efac', fontWeight: '500' }}>
            {stats.totalProfit < 0 ? t.totalLoss : t.totalProfit}
          </div>
          <div style={{ fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: '700', color: stats.totalProfit < 0 ? '#f87171' : '#4ade80' }}>
            {(stats.totalProfit || 0).toLocaleString()} {t.birr}
          </div>
        </div>
      </div>

    </div>
  );
}

export default ReportsPage;