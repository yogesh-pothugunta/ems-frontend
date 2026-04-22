import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.user.role === 'admin') navigate('/admin');
      else if (res.data.user.role === 'hr') navigate('/hr');
      else navigate('/employee');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>EMS Login</h1>
        <p style={styles.subtitle}>Employee Management System</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" placeholder="Enter your email"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button style={loading ? styles.buttonDisabled : styles.button}
            type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  card: { background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '100%', maxWidth: '400px' },
  title: { fontSize: '28px', fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: '8px' },
  subtitle: { color: '#666', textAlign: 'center', marginBottom: '30px', fontSize: '14px' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '6px', color: '#555', fontWeight: '500', fontSize: '14px' },
  input: { width: '100%', padding: '12px 16px', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
  button: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
  buttonDisabled: { width: '100%', padding: '14px', background: '#ccc', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'not-allowed', marginTop: '10px' },
  error: { background: '#ffe0e0', color: '#d00', padding: '10px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' },
};

export default Login;