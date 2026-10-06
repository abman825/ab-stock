import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClipboardList, 
  Search, 
  RefreshCw, 
  User, 
  Package, 
  Clock, 
  Filter,
  AlertCircle 
} from 'lucide-react';

// 3ti languages er dictionary translations
const translations = {
  am: {
    title: "የሰራተኞች እንቅስቃሴ መዝገብ",
    subtitleBuilding: "በስርዓቱ ላይ በተጠቃሚዎች የተከናወኑ ተግባራትን በቅጽበት ይከታተሉ (ሕንፃ መሣሪያ)",
    subtitlePharmacy: "በስርዓቱ ላይ በተጠቃሚዎች የተከናወኑ ተግባራትን በቅጽበት ይከታተሉ (ፋርማሲ)",
    refresh: "አዲስ (Refresh)",
    searchPlaceholder: "በሰራተኛ ስም፣ በምርት ወይም በዝርዝር መረጃ ይፈልጉ...",
    allActions: "ሁሉም ተግባራት",
    actionCreate: "አዲስ የተጨመሩ (CREATE / ADD)",
    actionEdit: "የተሻሻሉ (EDIT / UPDATE)",
    actionDelete: "የተሰረዙ (DELETE)",
    thDateTime: "ቀን እና ሰዓት",
    thEmployee: "ሰራተኛ",
    thAction: "ተግባር",
    thProduct: "ምርት",
    thDetails: "ዝርዝር መረጃ",
    loading: "መረጃው በመጫን ላይ ነው...",
    noLogsFound: "ምንም ዓይነት የእንቅስቃሴ መዝገብ አልተገኘም",
    noLogsSub: "እባክዎን የፍለጋ ወይም የፊልተር መስፈርቱን ይቀይሩ",
    unknownUser: "ያልታወቀ"
  },
  om: {
    title: "Galmee Sochii Hojjettootaa",
    subtitleBuilding: "Gochaalee fayyadamtoataan raawwataman hordofaa (Meeshaalee Ijaarsaa)",
    subtitlePharmacy: "Gochaalee fayyadamtoataan raawwataman hordofaa (Faarmaasii)",
    refresh: "Haaromsi (Refresh)",
    searchPlaceholder: "Maqaa hojjetaa, oomisha ykn odeeffannoon barbaadi...",
    allActions: "Gochoota Hundumaa",
    actionCreate: "Haaraa Dabalame (CREATE / ADD)",
    actionEdit: "Kan Fooyya'e (EDIT / UPDATE)",
    actionDelete: "Kan Haqame (DELETE)",
    thDateTime: "Guyyaa fi Sa'aatii",
    thEmployee: "Hojjetaa",
    thAction: "Gocha",
    thProduct: "Oomisha",
    thDetails: "Odeeffannoo Bal'aa",
    loading: "Odeeffannoon fe'amaa jira...",
    noLogsFound: "Galmeen sochii tokkollee hin argamne",
    noLogsSub: "Maaloo ulaagaa barbaacha ykn calallii jijjiiraa",
    unknownUser: "Hin beekamu"
  },
  en: {
    title: "Activity Logs",
    subtitleBuilding: "Real-time log of actions performed by system users (Building Materials)",
    subtitlePharmacy: "Real-time log of actions performed by system users (Pharmacy)",
    refresh: "Refresh",
    searchPlaceholder: "Search by employee, product, or details...",
    allActions: "All Actions",
    actionCreate: "Created / Added",
    actionEdit: "Edited / Updated",
    actionDelete: "Deleted",
    thDateTime: "Date & Time",
    thEmployee: "Employee",
    thAction: "Action",
    thProduct: "Product",
    thDetails: "Details",
    loading: "Loading logs...",
    noLogsFound: "No activity logs found",
    noLogsSub: "Please try changing search terms or action filters",
    unknownUser: "Unknown"
  }
};

function ActivityLog({ API_BASE_URL, businessType = 'pharmacy' }) {
  // Multi-language State setup
  const [lang, setLang] = useState(() => localStorage.getItem('appLanguage') || 'am');
  const t = translations[lang] || translations.am;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = API_BASE_URL || 'http://localhost:5000/api';
      
      const res = await axios.get(`${baseUrl}/activity-logs`, {
        params: { businessType },
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      setLogs(res.data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    const handleLangChange = () => {
      const savedLang = localStorage.getItem('appLanguage') || 'am';
      setLang(savedLang);
    };

    window.addEventListener('storage', handleLangChange);
    window.addEventListener('languageChanged', handleLangChange);

    return () => {
      window.removeEventListener('storage', handleLangChange);
      window.removeEventListener('languageChanged', handleLangChange);
    };
  }, [API_BASE_URL, businessType]);

  // Action Badges Color Helper
  const getBadgeStyle = (action) => {
    const act = action?.toUpperCase();
    switch (act) {
      case 'DELETE':
        return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
      case 'EDIT':
      case 'UPDATE':
        return { bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
      case 'CREATE':
      case 'ADD':
        return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    }
  };

  // Filter Logic (Search + Action Filter + BusinessType Check)
  const filteredLogs = logs.filter((log) => {
    if (log.businessType && log.businessType !== businessType) {
      return false;
    }

    const employee = (log.employeeName || log.userId?.fullName || log.userId?.name || log.userId?.username || '').toLowerCase();
    const product = (log.productName || '').toLowerCase();
    const details = (log.details || '').toLowerCase();
    const action = (log.action || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = 
      employee.includes(search) || 
      product.includes(search) || 
      details.includes(search) || 
      action.includes(search);

    const matchesAction = 
      selectedAction === 'ALL' || 
      log.action?.toUpperCase() === selectedAction ||
      (selectedAction === 'CREATE' && log.action?.toUpperCase() === 'ADD') ||
      (selectedAction === 'EDIT' && log.action?.toUpperCase() === 'UPDATE');

    return matchesSearch && matchesAction;
  });

  const isBuilding = businessType === 'building_materials' || businessType === 'building';

  return (
    <div style={{ padding: '24px', width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList style={{ color: '#2563eb' }} size={22} />
            {t.title}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            {isBuilding ? t.subtitleBuilding : t.subtitlePharmacy}
          </p>
        </div>

        <button 
          onClick={fetchLogs}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            color: '#334155',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
          onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {t.refresh}
        </button>
      </div>

      {/* Control Bar: Search & Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Filter size={15} style={{ position: 'absolute', left: '10px', color: '#64748b' }} />
          <select 
            value={selectedAction} 
            onChange={(e) => setSelectedAction(e.target.value)}
            style={{
              padding: '9px 12px 9px 32px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              background: '#fff',
              color: '#334155',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="ALL">{t.allActions}</option>
            <option value="CREATE">{t.actionCreate}</option>
            <option value="EDIT">{t.actionEdit}</option>
            <option value="DELETE">{t.actionDelete}</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', minWidth: '650px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
              <th style={{ padding: '12px 16px' }}>{t.thDateTime}</th>
              <th style={{ padding: '12px 16px' }}>{t.thEmployee}</th>
              <th style={{ padding: '12px 16px' }}>{t.thAction}</th>
              <th style={{ padding: '12px 16px' }}>{t.thProduct}</th>
              <th style={{ padding: '12px 16px' }}>{t.thDetails}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading Skeleton
              [1, 2, 3, 4].map((idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td colSpan="5" style={{ padding: '16px', color: '#94a3b8', textAlign: 'center' }}>
                    {t.loading}
                  </td>
                </tr>
              ))
            ) : filteredLogs.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan="5" style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                    <AlertCircle size={32} strokeWidth={1.5} />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{t.noLogsFound}</span>
                    <span style={{ fontSize: '12px' }}>{t.noLogsSub}</span>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              filteredLogs.map((log) => {
                const badgeStyle = getBadgeStyle(log.action);
                return (
                  <tr 
                    key={log._id} 
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Timestamp */}
                    <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} style={{ color: '#94a3b8' }} />
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                      </span>
                    </td>

                    {/* Employee Name */}
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1e293b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} style={{ color: '#64748b' }} />
                        {log.employeeName || log.userId?.fullName || log.userId?.name || log.userId?.username || t.unknownUser}
                      </span>
                    </td>

                    {/* Action Badge */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        letterSpacing: '0.3px',
                        display: 'inline-block',
                        textTransform: 'uppercase',
                        backgroundColor: badgeStyle.bg,
                        color: badgeStyle.color,
                        border: `1px solid ${badgeStyle.border}`
                      }}>
                        {log.action || 'INFO'}
                      </span>
                    </td>

                    {/* Product */}
                    <td style={{ padding: '12px 16px', color: '#334155', fontWeight: '500' }}>
                      {log.productName ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Package size={14} style={{ color: '#94a3b8' }} />
                          {log.productName}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>

                    {/* Details */}
                    <td style={{ padding: '12px 16px', color: '#475569', maxWidth: '280px', wordBreak: 'break-word' }}>
                      {log.details || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ActivityLog;