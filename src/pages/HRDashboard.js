import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function HRDashboard() {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState('employees');
  const [reviewForm, setReviewForm] = useState({
    employeeId: '', rating: '5', comments: '', period: '', goals: ''
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchEmployees();
    fetchLeaves();
    fetchReviews();
    fetchAttendance();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/employees', { headers });
      setEmployees(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/leaves', { headers });
      setLeaves(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/performance', { headers });
      setReviews(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/attendance/today', { headers });
      setAttendance(res.data);
    } catch (err) { console.error(err); }
  };

  const handleLeaveStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/leaves/${id}`, { status }, { headers });
      alert(`Leave ${status}! ✅`);
      fetchLeaves();
    } catch (err) { alert('Error'); }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/performance', reviewForm, { headers });
      alert('Review added! ✅');
      setReviewForm({ employeeId: '', rating: '5', comments: '', period: '', goals: '' });
      fetchReviews();
    } catch (err) { alert('Error adding review'); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const tabs = ['employees', 'leaves', 'attendance', 'reviews'];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>HR Dashboard</h1>
        <div style={styles.headerRight}>
          <span style={styles.welcome}>Welcome, {user?.name}!</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <h2 style={styles.statNumber}>{employees.length}</h2>
          <p style={styles.statLabel}>Total Employees</p>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f093fb, #f5576c)'}}>
          <h2 style={styles.statNumber}>{leaves.filter(l => l.status === 'pending').length}</h2>
          <p style={styles.statLabel}>Pending Leaves</p>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #4facfe, #00f2fe)'}}>
          <h2 style={styles.statNumber}>{attendance.length}</h2>
          <p style={styles.statLabel}>Present Today</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? styles.activeTab : styles.tab}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'leaves' && leaves.filter(l => l.status === 'pending').length > 0 && (
              <span style={styles.badge}>
                {leaves.filter(l => l.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={styles.content}>

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Position</th>
                  <th style={styles.th}>Salary</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp._id} style={styles.tableRow}>
                    <td style={styles.td}>{emp.userId?.name || 'N/A'}</td>
                    <td style={styles.td}>{emp.userId?.email || 'N/A'}</td>
                    <td style={styles.td}>{emp.department}</td>
                    <td style={styles.td}>{emp.position}</td>
                    <td style={styles.td}>₹{emp.salary?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Leaves Tab */}
        {activeTab === 'leaves' && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>From</th>
                  <th style={styles.th}>To</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(leave => (
                  <tr key={leave._id} style={styles.tableRow}>
                    <td style={styles.td}>{leave.employeeId?.name || 'N/A'}</td>
                    <td style={styles.td}>{leave.leaveType}</td>
                    <td style={styles.td}>{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td style={styles.td}>{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td style={styles.td}>{leave.reason}</td>
                    <td style={styles.td}>
                      <span style={leave.status === 'approved' ? styles.approvedBadge : leave.status === 'rejected' ? styles.rejectedBadge : styles.pendingBadge}>
                        {leave.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {leave.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleLeaveStatus(leave._id, 'approved')} style={styles.approveBtn}>Approve</button>
                          <button onClick={() => handleLeaveStatus(leave._id, 'rejected')} style={styles.rejectBtn}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leaves.length === 0 && <p style={styles.noData}>No leave requests!</p>}
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div>
            <h3 style={{ marginBottom: '16px', color: '#333' }}>
              Today's Attendance — {new Date().toLocaleDateString()}
            </h3>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.th}>Check In</th>
                    <th style={styles.th}>Check Out</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map(a => (
                    <tr key={a._id} style={styles.tableRow}>
                      <td style={styles.td}>{a.employeeId?.name || 'N/A'}</td>
                      <td style={styles.td}>{a.checkIn || '--'}</td>
                      <td style={styles.td}>{a.checkOut || '--'}</td>
                      <td style={styles.td}>
                        <span style={styles.presentBadge}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendance.length === 0 && <p style={styles.noData}>No attendance today!</p>}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            {/* Add Review Form */}
            <form onSubmit={handleAddReview} style={styles.form}>
              <h3 style={{ marginBottom: '16px', color: '#333' }}>Add Performance Review</h3>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Select Employee</label>
                  <select style={styles.input} value={reviewForm.employeeId}
                    onChange={(e) => setReviewForm({...reviewForm, employeeId: e.target.value})} required>
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.userId?._id} value={emp.userId?._id}>
                        {emp.userId?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Rating (1-5)</label>
                  <select style={styles.input} value={reviewForm.rating}
                    onChange={(e) => setReviewForm({...reviewForm, rating: e.target.value})}>
                    {[5,4,3,2,1].map(r => (
                      <option key={r} value={r}>{'⭐'.repeat(r)} ({r})</option>
                    ))}
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Period (e.g. Q1 2026)</label>
                  <input style={styles.input} type="text" value={reviewForm.period}
                    onChange={(e) => setReviewForm({...reviewForm, period: e.target.value})} required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Goals</label>
                  <input style={styles.input} type="text" value={reviewForm.goals}
                    onChange={(e) => setReviewForm({...reviewForm, goals: e.target.value})} />
                </div>
                <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
                  <label style={styles.label}>Comments</label>
                  <textarea style={{...styles.input, height: '80px'}} value={reviewForm.comments}
                    onChange={(e) => setReviewForm({...reviewForm, comments: e.target.value})} required />
                </div>
              </div>
              <button type="submit" style={styles.submitBtn}>Add Review ✅</button>
            </form>

            {/* Reviews List */}
            <h3 style={{ margin: '24px 0 16px', color: '#333' }}>All Reviews</h3>
            {reviews.map(review => (
              <div key={review._id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <span style={styles.reviewName}>{review.employeeId?.name}</span>
                  <span style={styles.reviewRating}>{'⭐'.repeat(review.rating)}</span>
                </div>
                <p style={styles.reviewPeriod}>Period: {review.period}</p>
                <p style={styles.reviewComment}>{review.comments}</p>
                {review.goals && <p style={styles.reviewGoals}>Goals: {review.goals}</p>}
                <p style={styles.reviewBy}>Reviewed by: {review.reviewedBy?.name}</p>
              </div>
            ))}
            {reviews.length === 0 && <p style={styles.noData}>No reviews yet!</p>}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  header: { background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: '24px', fontWeight: 'bold' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { color: 'white', fontSize: '14px' },
  logoutBtn: { padding: '8px 16px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', borderRadius: '8px', cursor: 'pointer' },
  statsRow: { display: 'flex', gap: '20px', padding: '30px', flexWrap: 'wrap' },
  statCard: { background: 'linear-gradient(135deg, #11998e, #38ef7d)', borderRadius: '12px', padding: '24px', flex: '1', minWidth: '150px', color: 'white' },
  statNumber: { fontSize: '36px', fontWeight: 'bold' },
  statLabel: { fontSize: '14px', opacity: '0.9', marginTop: '4px' },
  tabs: { display: 'flex', padding: '0 30px', gap: '4px', flexWrap: 'wrap' },
  tab: { padding: '12px 24px', background: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#666', borderRadius: '8px 8px 0 0', position: 'relative' },
  activeTab: { padding: '12px 24px', background: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#11998e', fontWeight: 'bold', borderBottom: '3px solid #11998e', borderRadius: '8px 8px 0 0', position: 'relative' },
  badge: { background: '#f5576c', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '11px', marginLeft: '6px' },
  content: { margin: '0 30px 30px', background: 'white', borderRadius: '0 12px 12px 12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { background: '#f8f9fa' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555', borderBottom: '2px solid #e1e5e9' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#333' },
  pendingBadge: { background: '#fff3e0', color: '#e65100', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  approvedBadge: { background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  rejectedBadge: { background: '#ffebee', color: '#c62828', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  presentBadge: { background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  approveBtn: { padding: '6px 12px', background: '#e8f5e9', color: '#2e7d32', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  rejectBtn: { padding: '6px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  form: { background: '#f8f9fa', padding: '24px', borderRadius: '12px', marginBottom: '24px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '6px' },
  input: { padding: '10px 14px', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  submitBtn: { marginTop: '16px', padding: '12px 32px', background: 'linear-gradient(135deg, #11998e, #38ef7d)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' },
  reviewCard: { background: '#f8f9fa', borderRadius: '12px', padding: '20px', marginBottom: '16px', borderLeft: '4px solid #11998e' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  reviewName: { fontWeight: 'bold', fontSize: '16px', color: '#333' },
  reviewRating: { fontSize: '16px' },
  reviewPeriod: { color: '#666', fontSize: '13px', marginBottom: '8px' },
  reviewComment: { color: '#444', fontSize: '14px', marginBottom: '8px' },
  reviewGoals: { color: '#11998e', fontSize: '13px', marginBottom: '8px' },
  reviewBy: { color: '#999', fontSize: '12px' },
  noData: { textAlign: 'center', padding: '40px', color: '#999' },
};

export default HRDashboard;