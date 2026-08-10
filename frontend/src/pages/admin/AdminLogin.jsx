import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.user.role !== 'admin') {
        toast.error('Admin access only');
        setLoading(false);
        return;
      }
      login(res.data.token, res.data.user);
      toast.success('Welcome, Admin! 👑');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020c04 0%, #0a1628 50%, #030e05 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👑</div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.4rem' }}>Admin Control Panel</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>VegetableTonnes Platform Management</p>
        </div>
        <div className="glass-card-strong" style={{ padding: '2rem', borderRadius: '20px' }}>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Admin Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@vegetabletonnes.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Admin password" required />
            </div>
            <div style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#047857', fontWeight: 600 }}>
              Demo: admin@vegetabletonnes.com / password
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
              {loading ? '⏳ Signing in...' : '👑 Access Admin Panel'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
