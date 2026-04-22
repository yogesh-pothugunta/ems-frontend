import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import HRDashboard from './pages/HRDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  if (!token) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/hr" element={
          <PrivateRoute allowedRoles={['hr']}>
            <HRDashboard />
          </PrivateRoute>
        } />
        <Route path="/employee" element={
          <PrivateRoute allowedRoles={['employee']}>
            <EmployeeDashboard />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;