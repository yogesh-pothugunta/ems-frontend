import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#667eea', '#11998e', '#f5576c', '#f093fb', '#4facfe', '#38ef7d'];

function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('dashboard');
  const itemsPerPage = 5;
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    department: '', position: '', salary: '',
    phone: '', address: ''
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchEmployees(); fetchLeaves(); }, []);

  useEffect(() => {
    let result = employees;
    if (search) result = result.filter(e =>
      e.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.userId?.email?.toLowerCase().includes(search.toLowerCase())
    );
    if (deptFilter) result = result.filter(e => e.department === deptFilter);
    setFiltered(result);
    setCurrentPage(1);
  }, [search, deptFilter, employees]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('https://ems-backend-en67.onrender.com/api/employees', { headers });
      setEmployees(res.data);
      setFiltered(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('https://ems-backend-en67.onrender.com/api/leaves', { headers });
      setLeaves(res.data);
    } catch (err) { console.error(err); }
  };

  // Charts data
  const deptData = Object.entries(
    employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  const leaveData = [
    { name: 'Pending', value: leaves.filter(l => l.status === 'pending').length },
    { name: 'Approved', value: leaves.filter(l => l.status === 'approved').length },
    { name: 'Rejected', value: leaves.filter(l => l.status === 'rejected').length },
  ].filter(d => d.value > 0);

  const salaryData = Object.entries(
    employees.reduce((acc, emp) => {
      if (!acc[emp.department]) acc[emp.department] = { total: 0, count: 0 };
      acc[emp.department].total += emp.salary;
      acc[emp.department].count += 1;
      return acc;
    }, {})
  ).map(([dept, data]) => ({
    dept,
    avgSalary: Math.round(data.total / data.count)
  }));

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const departments = [...new Set(employees.map(e => e.department))];

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://ems-backend-en67.onrender.com/api/employees', form, { headers });
      alert('Employee created! ✅');
      setShowForm(false);
      resetForm();
      fetchEmployees();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`https://ems-backend-en67.onrender.com/api/employees/${editEmployee._id}`, {
        department: form.department, position: form.position,
        salary: form.salary, phone: form.phone, address: form.address
      }, { headers });
      alert('Updated! ✅');
      setEditEmployee(null);
      resetForm();
      fetchEmployees();
    } catch (err) { alert('Error'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try {
      await axios.delete(`https://ems-backend-en67.onrender.com/api/employees/${id}`, { headers });
      fetchEmployees();
    } catch (err) { alert('Error'); }
  };

  const openEdit = (emp) => {
    setEditEmployee(emp);
    setForm({ name: emp.userId?.name || '', email: emp.userId?.email || '', password: '',
      department: emp.department, position: emp.position, salary: emp.salary,
      phone: emp.phone || '', address: emp.address || '' });
    setShowForm(false);
  };

  const resetForm = () => setForm({ name: '', email: '', password: '', department: '', position: '', salary: '', phone: '', address: '' });
  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Admin Dashboard</h1>
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
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #11998e, #38ef7d)'}}>
          <h2 style={styles.statNumber}>{employees.filter(e => e.isActive).length}</h2>
          <p style={styles.statLabel}>Active Employees</p>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f093fb, #f5576c)'}}>
          <h2 style={styles.statNumber}>{departments.length}</h2>
          <p style={styles.statLabel}>Departments</p>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #4facfe, #00f2fe)'}}>
          <h2 style={styles.statNumber}>{leaves.filter(l => l.status === 'pending').length}</h2>
          <p style={styles.statLabel}>Pending Leaves</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['dashboard', 'employees'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? styles.activeTab : styles.tab}>
            {tab === 'dashboard' ? '📊 Charts' : '👥 Employees'}
          </button>
        ))}
      </div>

      <div style={styles.section}>

        {/* Charts Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={styles.chartsGrid}>
              {/* Department wise employees */}
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Employees by Department</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={deptData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#667eea" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Leave status pie */}
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Leave Requests Status</h3>
                {leaveData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={leaveData} dataKey="value" nameKey="name"
                        cx="50%" cy="50%" outerRadius={80} label>
                        {leaveData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={styles.noData}>No leave data yet!</p>
                )}
              </div>

              {/* Avg salary by dept */}
              <div style={{...styles.chartCard, gridColumn: 'span 2'}}>
                <h3 style={styles.chartTitle}>Average Salary by Department</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={salaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dept" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                    <Bar dataKey="avgSalary" fill="#11998e" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div>
            {/* Search + Filter */}
            <div style={styles.searchSection}>
              <input style={styles.searchInput} placeholder="Search by name or email..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
              <select style={styles.filterSelect} value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}>
                <option value="">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {(search || deptFilter) && (
                <button style={styles.clearBtn} onClick={() => { setSearch(''); setDeptFilter(''); }}>Clear</button>
              )}
              <button onClick={() => { setShowForm(!showForm); setEditEmployee(null); resetForm(); }} style={styles.addBtn}>
                {showForm ? 'Cancel' : '+ Add Employee'}
              </button>
            </div>

            {/* Add Form */}
            {showForm && (
              <form onSubmit={handleCreate} style={styles.form}>
                <h3 style={{ marginBottom: '16px' }}>Add New Employee</h3>
                <div style={styles.formGrid}>
                  {[
                    { label: 'Full Name', key: 'name', type: 'text' },
                    { label: 'Email', key: 'email', type: 'email' },
                    { label: 'Password', key: 'password', type: 'password' },
                    { label: 'Department', key: 'department', type: 'text' },
                    { label: 'Position', key: 'position', type: 'text' },
                    { label: 'Salary', key: 'salary', type: 'number' },
                    { label: 'Phone', key: 'phone', type: 'text' },
                    { label: 'Address', key: 'address', type: 'text' },
                  ].map(field => (
                    <div key={field.key} style={styles.inputGroup}>
                      <label style={styles.label}>{field.label}</label>
                      <input style={styles.input} type={field.type}
                        value={form[field.key]}
                        onChange={(e) => setForm({...form, [field.key]: e.target.value})} required />
                    </div>
                  ))}
                </div>
                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Employee'}
                </button>
              </form>
            )}

            {/* Edit Form */}
            {editEmployee && (
              <form onSubmit={handleUpdate} style={{...styles.form, background: '#fff3e0'}}>
                <h3 style={{ marginBottom: '16px', color: '#e65100' }}>Edit — {editEmployee.userId?.name}</h3>
                <div style={styles.formGrid}>
                  {[
                    { label: 'Department', key: 'department', type: 'text' },
                    { label: 'Position', key: 'position', type: 'text' },
                    { label: 'Salary', key: 'salary', type: 'number' },
                    { label: 'Phone', key: 'phone', type: 'text' },
                    { label: 'Address', key: 'address', type: 'text' },
                  ].map(field => (
                    <div key={field.key} style={styles.inputGroup}>
                      <label style={styles.label}>{field.label}</label>
                      <input style={styles.input} type={field.type}
                        value={form[field.key]}
                        onChange={(e) => setForm({...form, [field.key]: e.target.value})} required />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="submit" style={styles.updateBtn} disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                  </button>
                  <button type="button" onClick={() => setEditEmployee(null)} style={styles.cancelBtn}>Cancel</button>
                </div>
              </form>
            )}

            {/* Table */}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Department</th>
                    <th style={styles.th}>Position</th>
                    <th style={styles.th}>Salary</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(emp => (
                    <tr key={emp._id} style={styles.tableRow}>
                      <td style={styles.td}>{emp.userId?.name || 'N/A'}</td>
                      <td style={styles.td}>{emp.userId?.email || 'N/A'}</td>
                      <td style={styles.td}>{emp.department}</td>
                      <td style={styles.td}>{emp.position}</td>
                      <td style={styles.td}>₹{emp.salary?.toLocaleString()}</td>
                      <td style={styles.td}>
                        <span style={emp.isActive ? styles.activeBadge : styles.inactiveBadge}>
                          {emp.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => openEdit(emp)} style={styles.editBtn}>Edit</button>
                          <button onClick={() => handleDelete(emp._id)} style={styles.deleteBtn}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p style={styles.noData}>No employees found!</p>}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button style={currentPage === 1 ? styles.pageDisabled : styles.pageBtn}
                  onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Previous</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} style={currentPage === i + 1 ? styles.pageActive : styles.pageBtn}
                    onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                ))}
                <button style={currentPage === totalPages ? styles.pageDisabled : styles.pageBtn}
                  onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  header: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: '24px', fontWeight: 'bold' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { color: 'white', fontSize: '14px' },
  logoutBtn: { padding: '8px 16px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', borderRadius: '8px', cursor: 'pointer' },
  statsRow: { display: 'flex', gap: '20px', padding: '30px', flexWrap: 'wrap' },
  statCard: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '24px', flex: '1', minWidth: '150px', color: 'white' },
  statNumber: { fontSize: '36px', fontWeight: 'bold' },
  statLabel: { fontSize: '14px', opacity: '0.9', marginTop: '4px' },
  tabs: { display: 'flex', padding: '0 30px', gap: '4px' },
  tab: { padding: '12px 24px', background: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#666', borderRadius: '8px 8px 0 0' },
  activeTab: { padding: '12px 24px', background: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#667eea', fontWeight: 'bold', borderBottom: '3px solid #667eea', borderRadius: '8px 8px 0 0' },
  section: { margin: '0 30px 30px', background: 'white', borderRadius: '0 12px 12px 12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' },
  chartCard: { background: '#f8f9fa', borderRadius: '12px', padding: '20px' },
  chartTitle: { fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' },
  searchSection: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  searchInput: { flex: '1', minWidth: '200px', padding: '10px 16px', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  filterSelect: { padding: '10px 16px', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  clearBtn: { padding: '10px 20px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  addBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  form: { background: '#f8f9fa', padding: '24px', borderRadius: '12px', marginBottom: '24px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '6px' },
  input: { padding: '10px 14px', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  submitBtn: { marginTop: '16px', padding: '12px 32px', background: 'linear-gradient(135deg, #11998e, #38ef7d)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  updateBtn: { padding: '12px 32px', background: 'linear-gradient(135deg, #f093fb, #f5576c)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  cancelBtn: { padding: '12px 32px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { background: '#f8f9fa' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555', borderBottom: '2px solid #e1e5e9' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#333' },
  activeBadge: { background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  inactiveBadge: { background: '#ffebee', color: '#c62828', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  editBtn: { padding: '6px 14px', background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  deleteBtn: { padding: '6px 14px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  noData: { textAlign: 'center', padding: '40px', color: '#999' },
  pagination: { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' },
  pageBtn: { padding: '8px 14px', background: 'white', border: '2px solid #e1e5e9', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  pageActive: { padding: '8px 14px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  pageDisabled: { padding: '8px 14px', background: '#f0f0f0', border: '2px solid #e1e5e9', borderRadius: '8px', cursor: 'not-allowed', fontSize: '14px', color: '#999' },
};

export default AdminDashboard;
