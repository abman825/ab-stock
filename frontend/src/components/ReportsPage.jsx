import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

const translations = {
  am: {
    title: '📊 የሽያጭ እና የትርፍ ሪፖርት',
    subtitle: 'የንግድ እንቅስቃሴዎን እና ዕለታዊ ሽያጭዎን እዚህ ይከታተሉ።',
    pharmacy: '💊 የፋርማሲ',
    building: '🏗️ የሕንፃ መሣሪያ',
    daily: 'የዛሬ (Daily)',
    weekly: 'የዚህ ሳምንት',
    monthly: 'የዚህ ወር',
    yearly: 'የዚህ ዓመት',
    profit: 'ትርፍ',
    totalSales: 'ሁልጊዜ አጠቃላይ ሽያጭ',
    totalProfit: 'አጠቃላይ ትርፍ',
    tableTitle: '📅 የዕለታዊ ሽያጮች እና ትርፍ መዝገብ (ከመጀመሪያው ቀን ጀምሮ)',
    searchDate: 'ቀን ፈልግ:',
    clear: 'አፅዳ',
    dateCol: 'ቀን (Date)',
    salesCol: 'የዕለቱ ሽያጭ (Birr)',
    profitCol: 'የዕለቱ ትርፍ (Birr)',
    noData: 'ምንም የሽያጭ መዝገብ አልተገኘም።',
    loading: '⏳ መረጃው እየተጫነ ነው...',
    birr: 'ብር'
  },
  en: {
    title: '📊 Sales & Profit Report',
    subtitle: 'Track your business activity and daily sales performance here.',
    pharmacy: '💊 Pharmacy',
    building: '🏗️ Building Materials',
    daily: 'Today (Daily)',
    weekly: 'This Week',
    monthly: 'This Month',
    yearly: 'This Year',
    profit: 'Profit',
    totalSales: 'All-time Total Sales',
    totalProfit: 'All-time Total Profit',
    tableTitle: '📅 Daily Sales & Profit History (From Day One)',
    searchDate: 'Filter Date:',
    clear: 'Clear',
    dateCol: 'Date',
    salesCol: 'Daily Sales (Birr)',
    profitCol: 'Daily Profit (Birr)',
    noData: 'No sales records found.',
    loading: '⏳ Loading data...',
    birr: 'ETB'
  },
  om: {
    title: '📊 Gabaasa Gurgurtaa fi Bu’aa',
    subtitle: 'Sochii daldala keessaniifi gurgurtaa guyyaa asitti hordofaa.',
    pharmacy: '💊 Faarmasii',
    building: '🏗️ Meeshaalee Ijaarsaa',
    daily: 'Har\'a (Guyyaa)',
    weekly: 'Torban Kana',
    monthly: 'Ji\'a Kana',
    yearly: 'Waggaa Kana',
    profit: 'Bu\'aa',
    totalSales: 'Ida\'ama Gurgurtaa Dimshaashaa',
    totalProfit: 'Ida\'ama Bu\'aa Dimshaashaa',
    tableTitle: '📅 Galmee Gurgurtaa fi Bu’aa Guyyaa (Guyyaa Jalqabaa Eegalee)',
    searchDate: 'Guyyaa Barbaadi:',
    clear: 'Haqii',
    dateCol: 'Guyyaa (Date)',
    salesCol: 'Gurgurtaa Guyyaa (Birr)',
    profitCol: 'Bu\'aa Guyyaa (Birr)',
    noData: 'Galmeen gurgurtaa hin argamne.',
    loading: '⏳ Oolmaan fe\'amaa jira...',
    birr: 'Birr'
  }
};

function ReportsPage() {
  const [lang, setLang] = useState(localStorage.getItem('appLanguage') || 'am');
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

  const [dailyHistory, setDailyHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchDate, setSearchDate] = useState('');
  const [loading, setLoading] = useState(true);

  const t = translations[lang] || translations.am;

  const getSelectedBusinessType = () => {
    const rawType = localStorage.getItem('businessType') || 'pharmacy';
    return rawType.toLowerCase().includes('building') ? 'building_materials' : 'pharmacy';
  };

  const isBuilding = getSelectedBusinessType() === 'building_materials';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const currentBusinessType = getSelectedBusinessType();

      const statsRes = await axios.get(
        `${API_BASE_URL}/reports/analytics?businessType=${currentBusinessType}`,
        { headers: getAuthHeaders() }
      );
      if (statsRes.data) setStats(statsRes.data);

      const historyRes = await axios.get(
        `${API_BASE_URL}/reports/daily-history?businessType=${currentBusinessType}`,
        { headers: getAuthHeaders() }
      );
      if (historyRes.data) {
        setDailyHistory(historyRes.data);
        setFilteredHistory(historyRes.data);
      }

    } catch (err) {
      console.error('Error fetching reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
    const handleModeChange = () => fetchReportsData();
    const handleLangChange = () => {
      setLang(localStorage.getItem('appLanguage') || 'am');
    };

    window.addEventListener('businessTypeChanged', handleModeChange);
    window.addEventListener('languageChanged', handleLangChange);

    return () => {
      window.removeEventListener('businessTypeChanged', handleModeChange);
      window.removeEventListener('languageChanged', handleLangChange);
    };
  }, []);

  const handleDateSearch = (e) => {
    const value = e.target.value;
    setSearchDate(value);

    if (!value) {
      setFilteredHistory(dailyHistory);
      return;
    }

    const filtered = dailyHistory.filter((row) => {
      const rowDateStr = new Date(row.date).toISOString().split('T')[0];
      return rowDateStr.includes(value);
    });

    setFilteredHistory(filtered);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: '#64748b' }}>
        {t.loading}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '22px', fontWeight: '700' }}>{t.title}</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>{t.subtitle}</p>
        </div>

        <div>
          <span style={{ fontSize: '12px', background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '15px', fontWeight: '600' }}>
            {isBuilding ? t.building : t.pharmacy}
          </span>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{t.daily}</span>
          <h3 style={{ margin: '6px 0', color: '#0f172a', fontSize: '20px' }}>{(stats.dailySales || 0).toLocaleString()} {t.birr}</h3>
          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>📈 {t.profit}: {(stats.dailyProfit || 0).toLocaleString()} {t.birr}</span>
        </div>

        <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{t.weekly}</span>
          <h3 style={{ margin: '6px 0', color: '#0f172a', fontSize: '20px' }}>{(stats.weeklySales || 0).toLocaleString()} {t.birr}</h3>
          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>📈 {t.profit}: {(stats.weeklyProfit || 0).toLocaleString()} {t.birr}</span>
        </div>

        <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{t.monthly}</span>
          <h3 style={{ margin: '6px 0', color: '#0f172a', fontSize: '20px' }}>{(stats.monthlySales || 0).toLocaleString()} {t.birr}</h3>
          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>📈 {t.profit}: {(stats.monthlyProfit || 0).toLocaleString()} {t.birr}</span>
        </div>

        <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{t.yearly}</span>
          <h3 style={{ margin: '6px 0', color: '#0f172a', fontSize: '20px' }}>{(stats.yearlySales || 0).toLocaleString()} {t.birr}</h3>
          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>📈 {t.profit}: {(stats.yearlyProfit || 0).toLocaleString()} {t.birr}</span>
        </div>
      </div>

      {/* Total Banner */}
      <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{t.totalSales}</span>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '24px' }}>{(stats.totalSales || 0).toLocaleString()} {t.birr}</h2>
        </div>
        <div style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)', padding: '8px 16px', borderRadius: '8px' }}>
          <span style={{ fontSize: '11px', color: '#86efac' }}>{t.totalProfit}</span>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#4ade80' }}>{(stats.totalProfit || 0).toLocaleString()} {t.birr}</div>
        </div>
      </div>

      {/* Daily Sales History Table Section */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>
            {t.tableTitle}
          </h3>

          {/* Date Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t.searchDate}</label>
            <input
              type="date"
              value={searchDate}
              onChange={handleDateSearch}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                color: '#334155'
              }}
            />
            {searchDate && (
              <button
                onClick={() => { setSearchDate(''); setFilteredHistory(dailyHistory); }}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                {t.clear}
              </button>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '13px', color: '#64748b' }}>
                <th style={{ padding: '12px' }}>{t.dateCol}</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>{t.salesCol}</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>{t.profitCol}</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((row, idx) => {
                  const formattedDate = new Date(row.date).toLocaleDateString('en-GB');
                  const isNegative = row.totalProfit < 0;

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#334155' }}>
                        📅 {formattedDate}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                        {(row.totalSales || 0).toLocaleString()} {t.birr}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: isNegative ? '#dc2626' : '#16a34a' }}>
                        {(row.totalProfit || 0).toLocaleString()} {t.birr}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                    {t.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default ReportsPage;