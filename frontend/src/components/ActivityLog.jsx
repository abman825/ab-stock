import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

function ActivityLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/activity-logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(res.data);
      } catch (err) {
        console.error('Error fetching logs:', err);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div style={{ padding: '20px', width: '100%' }}>
      <h2>📋 Employee Activity Logs</h2>
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #dee2e6', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '10px' }}>Date & Time</th>
              <th style={{ padding: '10px' }}>Employee</th>
              <th style={{ padding: '10px' }}>Action</th>
              <th style={{ padding: '10px' }}>Product</th>
              <th style={{ padding: '10px' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{log.user}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    color: '#fff',
                    fontWeight: 'bold',
                    background: log.action === 'DELETE' ? '#dc3545' : log.action === 'EDIT' ? '#ffc107' : '#28a745'
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{log.productName}</td>
                <td style={{ padding: '10px' }}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ActivityLog;