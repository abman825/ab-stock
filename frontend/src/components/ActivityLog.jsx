import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ActivityLog({ API_BASE_URL }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        // App.jsx የሰጠውን API_BASE_URL በመጠቀም ጥሪ ማድረግ
        const baseUrl = API_BASE_URL || 'http://localhost:5000/api';
        
        const res = await axios.get(`${baseUrl}/activity-logs`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        setLogs(res.data);
      } catch (err) {
        console.error('Error fetching logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [API_BASE_URL]);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading activity logs...</div>;
  }

  return (
    <div style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '15px' }}>
        📋 Employee Activity Logs
      </h2>
      
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '12px 10px' }}>Date & Time</th>
              <th style={{ padding: '12px 10px' }}>Employee</th>
              <th style={{ padding: '12px 10px' }}>Action</th>
              <th style={{ padding: '12px 10px' }}>Product</th>
              <th style={{ padding: '12px 10px' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '15px', textAlign: 'center', color: '#94a3b8' }}>
                  No activity logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', color: '#64748b' }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                  </td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#1e293b' }}>
                    {log.user || 'Unknown'}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      background: log.action === 'DELETE' ? '#ef4444' : log.action === 'EDIT' ? '#f59e0b' : '#10b981'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '10px', fontWeight: '600', color: '#334155' }}>
                    {log.productName || '-'}
                  </td>
                  <td style={{ padding: '10px', color: '#475569' }}>
                    {log.details || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ActivityLog;