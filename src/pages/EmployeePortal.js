import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function EmployeePortal() {
  const [profile, setProfile] = useState(null);
  const [salary, setSalary] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [leaveForm, setLeaveForm] = useState({ 
    leaveType: 'sick', startDate: '', endDate: '', reason: '' 
  });
  const [attLoading, setAttLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchProfile();
    fetchSalary();
    fetchLeaves();
    fetchAttendance();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('https://ems-backend-en67.onrender.com/api/employees/me', { headers });
      setProfile(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchSalary = async () => {
    try {
      const res = await axios.get('https://ems-backend-en67.onrender.com/api/salary/my', { headers });
      setSalary(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('https://ems-backend-en67.onrender.com/api/leaves/my', { headers });
      setLeaves(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get('https://ems-backend-en67.onrender.com/api/attendance/my', { headers });
      setAttendance(res.data);
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = res.data.find(a => a.date === today);
      setTodayAttendance(todayRecord || null);
    } catch (err) { console.error(err); }
  };

  const handleCheckIn = async () => {
    setAttLoading(true);
    try {
      await axios.post('https://ems-backend-en67.onrender.com/api/attendance/checkin', {}, { headers });
      alert('Checked in successfully! ✅');
      fetchAttendance();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    setAttLoading(false);
  };

  const handleCheckOut = async () => {
    setAttLoading(true);
    try {
      await axios.post('https://ems-backend-en67.onrender.com/api/attendance/checkout', {}, { headers });
      alert('Checked out successfully! ✅');
      fetchAttendance();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    setAttLoading(false);
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://ems-backend-en67.onrender.com/api/leaves/apply', leaveForm, { headers });
      alert('Leave applied successfully! ✅');
      setLeaveForm({ leaveType: 'sick', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  // ✅ added exactly after handleLogout
  const downloadPDF = async () => {
    const element = document.getElementById('salary-slip');
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`salary-slip-${salary?.name}.pdf`);
  };

  const tabs = ['profile', 'attendance', 'salary', 'leaves'];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Employee Portal</h1>
        <div style={styles.headerRight}>
          <span style={styles.welcome}>Welcome, {user?.name}!</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.tabs}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? styles.activeTab : styles.tab}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.content}>

        {/* Salary Tab (REPLACED EXACTLY) */}
        {activeTab === 'salary' && salary && (
          <div>
            <div id="salary-slip" style={styles.salaryCard}>
              <h2 style={styles.salaryTitle}>💰 Salary Slip</h2>
              <p style={{ textAlign: 'center', color: '#666', marginBottom: '8px' }}>
                {salary.name} — {salary.position}
              </p>
              <p style={{ textAlign: 'center', color: '#999', marginBottom: '24px', fontSize: '13px' }}>
                {salary.department} | {salary.email}
              </p>

              <div style={styles.salaryGrid}>
                {[
                  { label: 'Basic Pay (60%)', value: salary.salarySlip?.basic },
                  { label: 'HRA (20%)', value: salary.salarySlip?.hra },
                  { label: 'Allowances (20%)', value: salary.salarySlip?.allowances },
                ].map(item => (
                  <div key={item.label} style={styles.salaryRow}>
                    <span style={{ color: '#555' }}>{item.label}</span>
                    <span style={styles.salaryAmount}>₹{item.value?.toLocaleString()}</span>
                  </div>
                ))}

                <div style={{...styles.salaryRow, borderTop: '2px solid #667eea', marginTop: '16px', paddingTop: '16px'}}>
                  <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Total CTC</span>
                  <span style={{...styles.salaryAmount, fontSize: '22px', color: '#667eea'}}>
                    ₹{salary.salarySlip?.total?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button onClick={downloadPDF} style={styles.downloadBtn}>
                📥 Download Salary Slip PDF
              </button>
            </div>
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
  tabs: { display: 'flex', padding: '24px 30px 0', gap: '4px' },
  tab: { padding: '12px 24px', background: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#666', borderRadius: '8px 8px 0 0' },
  activeTab: { padding: '12px 24px', background: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#f5576c', fontWeight: 'bold', borderBottom: '3px solid #f5576c', borderRadius: '8px 8px 0 0' },
  content: { margin: '0 30px 30px', background: 'white', borderRadius: '0 12px 12px 12px', padding: '24px' },
  salaryCard: { maxWidth: '500px', margin: '0 auto', background: '#f8f9fa', borderRadius: '12px', padding: '32px' },
  salaryTitle: { textAlign: 'center', marginBottom: '8px', color: '#333', fontSize: '22px' },
  salaryGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  salaryRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#555' },
  salaryAmount: { fontWeight: '600', color: '#333' },

  // ✅ added
  downloadBtn: { 
    padding: '12px 32px', 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: '600', 
    fontSize: '15px' 
  },
};

export default EmployeePortal;
