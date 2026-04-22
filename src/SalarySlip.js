import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function SalarySlip() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const headers = { Authorization: `Bearer ${token}` };
  const isEmployee = user?.role === 'employee';

  useEffect(() => { fetchSalaries(); }, []);

  const fetchSalaries = async () => {
    try {
      const url = isEmployee
        ? 'http://localhost:5000/api/salary/my'
        : 'http://localhost:5000/api/salary';
      const res = await axios.get(url, { headers });
      setSalaries(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const generatePDF = (salary) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('SALARY SLIP', 105, 20, { align: 'center' });
    doc.setFontSize(11);
    doc.text('Employee Management System', 105, 32, { align: 'center' });

    // Employee Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Details', 14, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${salary.employeeId?.userId?.name || salary.employeeId?.name || 'N/A'}`, 14, 65);
    doc.text(`Department: ${salary.employeeId?.department || 'N/A'}`, 14, 73);
    doc.text(`Position: ${salary.employeeId?.position || 'N/A'}`, 14, 81);
    doc.text(`Month: ${salary.month} / ${salary.year}`, 120, 65);
    doc.text(`Pay Date: ${salary.paidDate ? new Date(salary.paidDate).toLocaleDateString() : 'Pending'}`, 120, 73);
    doc.text(`Status: ${salary.status?.toUpperCase()}`, 120, 81);

    // Salary Table
    autoTable(doc, {
      startY: 95,
      head: [['Description', 'Amount (₹)']],
      body: [
        ['Basic Salary', `₹${salary.basicSalary?.toLocaleString() || 0}`],
        ['Allowances', `₹${salary.allowances?.toLocaleString() || 0}`],
        ['Deductions', `-₹${salary.deductions?.toLocaleString() || 0}`],
        ['Net Salary', `₹${salary.netSalary?.toLocaleString() || 0}`],
      ],
      styles: { fontSize: 11 },
      headStyles: { fillColor: [102, 126, 234] },
      bodyStyles: { textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [240, 242, 245] },
      foot: [['Total Payable', `₹${salary.netSalary?.toLocaleString() || 0}`]],
      footStyles: { fillColor: [17, 153, 142], textColor: 255, fontStyle: 'bold' },
    });

    doc.save(`SalarySlip_${salary.month}_${salary.year}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
          <h1 style={styles.headerTitle}>
            {isEmployee ? 'My Salary Slips' : 'All Salary Records'}
          </h1>
        </div>
      </div>

      <div style={styles.content}>
        {loading ? (
          <p style={styles.loading}>Loading...</p>
        ) : salaries.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>No salary records found!</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  {!isEmployee && <th style={styles.th}>Employee</th>}
                  <th style={styles.th}>Month/Year</th>
                  <th style={styles.th}>Basic Salary</th>
                  <th style={styles.th}>Allowances</th>
                  <th style={styles.th}>Deductions</th>
                  <th style={styles.th}>Net Salary</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Download</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map(salary => (
                  <tr key={salary._id} style={styles.tableRow}>
                    {!isEmployee && (
                      <td style={styles.td}>
                        {salary.employeeId?.userId?.name || 'N/A'}
                      </td>
                    )}
                    <td style={styles.td}>{salary.month}/{salary.year}</td>
                    <td style={styles.td}>₹{salary.basicSalary?.toLocaleString()}</td>
                    <td style={styles.td}>₹{salary.allowances?.toLocaleString()}</td>
                    <td style={styles.td}>₹{salary.deductions?.toLocaleString()}</td>
                    <td style={styles.td}>
                      <strong>₹{salary.netSalary?.toLocaleString()}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={salary.status === 'paid' ? styles.paidBadge : styles.pendingBadge}>
                        {salary.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => generatePDF(salary)} style={styles.downloadBtn}>
                        ⬇ PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  header: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px 30px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  backBtn: { padding: '8px 16px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', borderRadius: '8px', cursor: 'pointer' },
  headerTitle: { color: 'white', fontSize: '24px', fontWeight: 'bold' },
  content: { padding: '24px 30px' },
  loading: { textAlign: 'center', padding: '40px', color: '#999' },
  emptyCard: { background: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  emptyText: { color: '#999', fontSize: '16px' },
  tableContainer: { background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { background: '#f8f9fa' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555', borderBottom: '2px solid #e1e5e9' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#333' },
  paidBadge: { background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  pendingBadge: { background: '#fff8e1', color: '#f57f17', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  downloadBtn: { padding: '6px 14px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
};

export default SalarySlip;