import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function EmployeeDashboard() {
  const [profile, setProfile] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'sick', startDate: '', endDate: '', reason: ''
  });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchProfile(); fetchMyLeaves(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/employees/me', { headers });
      setProfile(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMyLeaves = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/leaves/my', { headers });
      setLeaves(res.data);
    } catch (err) { console.error(err); }
  };

  const handleLeaveApply = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/leaves', leaveForm, { headers });
      alert('Leave applied successfully! ✅');
      setLeaveForm({ leaveType: 'sick', startDate: '', endDate: '', reason: '' });
      fetchMyLeaves();
    } catch (err) { alert(err.response?.data?.message || 'Error applying leave'); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Employee Dashboard</h1>
        <div style={styles.headerRight}>
          <span style={styles.welcome}>Welcome, {user?.name}!</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.tabs}>
        {['profile', 'leaves', 'apply'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? styles.activeTab : styles.tab}>
            {tab === 'profile' ? 'My Profile' : tab === 'leaves' ? 'My Leaves' : 'Apply Leave'}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === 'profile' && profile && (
          <div style={styles.profileCard}>
            <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <h2 style={styles.profileName}>{user?.name}</h2>
            <p style={styles.profileRole}>{profile.position}</p>
            <div style={styles.infoGrid}>
              {[
                { label: 'Email', value: user?.email },
                { label: 'Department', value: profile.department },
                { label: 'Position', value: profile.position },
                { label: 'Phone', value: profile.phone },
                { label: 'Salary', value: `₹${profile.salary?.toLocaleString()}` },
                { label: 'Status', value: profile.isActive ? 'Active' : 'Inactive' },
              ].map(item => (
                <div key={item.label} style={styles.infoItem}>
                  <span style={styles.infoLabel}>{item.label}</span>
                  <span style={styles.infoValue}>{item.value || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>From</th>
                  <th style={styles.th}>To</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(leave => (
                  <tr key={leave._id} style={styles.tableRow}>
                    <td style={styles.td}>{leave.leaveType}</td>
                    <td style={styles.td}>{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td style={styles.td}>{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td style={styles.td}>{leave.reason}</td>
                    <td style={styles.td}>
                      <span style={leave.status === 'approved' ? styles.approvedBadge : leave.status === 'rejected' ? styles.rejectedBadge : styles.pendingBadge}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leaves.length === 0 && <p style={styles.noData}>No leave requests yet!</p>}
          </div>
        )}

        {activeTab === 'apply' && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Apply for Leave</h3>
            <form onSubmit={handleLeaveApply}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Leave Type</label>
                <select style={styles.input} value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({...leaveForm, leaveType: e.target.value})}>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="emergency">Emergency Leave</option>
                </select>
              </div>
              <div style={styles.formRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Start Date</label>
                  <input style={styles.input} type="date" value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})} required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>End Date</label>
                  <input style={styles.input} type="date" value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})} required />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Reason</label>
                <textarea style={{...styles.input, height: '100px', resize: 'none'}}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})} required />
              </div>
              <button type="submit" style={styles.submitBtn}>Apply Leave</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  header: { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: '24px', fontWeight: 'bold' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { color: 'white', fontSize: '14px' },
  logoutBtn: { padding: '8px 16px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', borderRadius: '8px', cursor: 'pointer' },
  tabs: { display: 'flex', padding: '20px 30px 0' },
  tab: { padding: '12px 24px', background: 'none', border: 'none', fontSize: '15px', cursor: 'pointer', color: '#666', borderBottom: '3px solid transparent' },
  activeTab: { padding: '12px 24px', background: 'none', border: 'none', fontSize: '15px', cursor: 'pointer', color: '#f5576c', fontWeight: '600', borderBottom: '3px solid #f5576c' },
  content: { padding: '24px 30px' },
  profileCard: { background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: '600px', margin: '0 auto', textAlign: 'center' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', fontSize: '32px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  profileName: { fontSize: '24px', fontWeight: 'bold', color: '#333' },
  profileRole: { color: '#666', marginBottom: '24px' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', textAlign: 'left' },
  infoItem: { background: '#f8f9fa', padding: '12px 16px', borderRadius: '8px' },
  infoLabel: { display: 'block', fontSize: '12px', color: '#999', marginBottom: '4px' },
  infoValue: { fontSize: '15px', fontWeight: '600', color: '#333' },
  tableContainer: { background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { background: '#f8f9fa' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555', borderBottom: '2px solid #e1e5e9' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#333' },
  approvedBadge: { background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  rejectedBadge: { background: '#ffebee', color: '#c62828', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  pendingBadge: { background: '#fff8e1', color: '#f57f17', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  noData: { textAlign: 'center', padding: '40px', color: '#999' },
  formCard: { background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: '500px' },
  formTitle: { fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '24px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 14px', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  submitBtn: { padding: '12px 32px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' },
};

export default EmployeeDashboard;