import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FaSeedling, FaLock, FaBuilding, FaUserPlus, FaCrown, FaSpinner, FaArrowRight } from 'react-icons/fa6';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab');
  const [tab, setTab] = useState(defaultTab === 'register' ? 'buyer' : 'login');
  const [loading, setLoading] = useState(false);
  const { login, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'farmer') navigate('/farmer-dashboard');
      else navigate('/dashboard');
    }
  }, [isLoggedIn, navigate, user]);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [buyerForm, setBuyerForm] = useState({ name: '', email: '', password: '', company: '', gstin: '', pan: '', phone: '', location: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', loginForm);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const role = res.data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'farmer' ? '/farmer-dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { ...buyerForm, role: 'buyer' });
      toast.success(res.data.message || 'Registration submitted! We will email your Buyer ID after approval.');
      setTab('login');
      setBuyerForm({ name: '', email: '', password: '', company: '', gstin: '', pan: '', phone: '', location: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const tabStyle = (active) => ({
    flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
    fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s',
    fontFamily: 'Inter, sans-serif',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    background: active ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'transparent',
    color: active ? '#fff' : '#6b7280',
  });

  return (
    <div className="page-section flex-center" style={{ padding: '3rem 1rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '540px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', color: '#22c55e', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
            <FaSeedling />
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif' }}>
            {tab === 'login' ? 'Welcome Back' : 'Register Bulk Buyer Account'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            {tab === 'login' ? 'Access your VegetableTonnes portal' : 'Create your verified buyer account and start bidding on farm produce'}
          </p>
        </div>

        <div className="glass-card-strong" style={{ padding: '2rem', borderRadius: '20px' }}>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '1.75rem' }}>
            <button onClick={() => setTab('login')} style={tabStyle(tab === 'login')}>
              <FaLock /> Login
            </button>
            <button onClick={() => setTab('buyer')} style={tabStyle(tab === 'buyer')}>
              <FaBuilding /> Buyer Registration
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === 'login' && (
              <motion.form key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                    placeholder="you@example.com" required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                    placeholder="Enter password" required />
                </div>
                <div style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
                  <strong style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaCrown style={{ color: '#fbbf24' }} /> Demo Accounts:
                  </strong>
                  <div style={{ color: '#6b7280', marginTop: '4px', lineHeight: 1.8 }}>
                    • Company Head (Admin): admin@vegetabletonnes.com / password<br/>
                    • Bulk Buyer: buyer@demo.com / password
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading ? <><FaSpinner className="animate-spin" /> Signing in...</> : <><FaLock /> Sign In</>}
                </button>
              </motion.form>
            )}

            {tab === 'buyer' && (
              <motion.form key="buyer" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleRegister}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={buyerForm.name} onChange={e => setBuyerForm({...buyerForm, name: e.target.value})} placeholder="Ramesh Mehta" required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={buyerForm.email} onChange={e => setBuyerForm({...buyerForm, email: e.target.value})} placeholder="buyer@company.com" required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={buyerForm.password} onChange={e => setBuyerForm({...buyerForm, password: e.target.value})} placeholder="Strong password" required />
                  </div>
                  <div className="form-group">
                    <label>Company Name</label>
                    <input type="text" value={buyerForm.company} onChange={e => setBuyerForm({...buyerForm, company: e.target.value})} placeholder="Apex Agri Foods Pvt Ltd" required />
                  </div>
                  <div className="form-group">
                    <label>GSTIN Number</label>
                    <input type="text" value={buyerForm.gstin} onChange={e => setBuyerForm({...buyerForm, gstin: e.target.value})} placeholder="29ABCDE1234F1ZH" required />
                  </div>
                  <div className="form-group">
                    <label>PAN Number</label>
                    <input type="text" value={buyerForm.pan} onChange={e => setBuyerForm({...buyerForm, pan: e.target.value})} placeholder="ABCDE1234F" required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" value={buyerForm.phone} onChange={e => setBuyerForm({...buyerForm, phone: e.target.value})} placeholder="+91 98765 43210" required />
                  </div>
                  <div className="form-group">
                    <label>Warehouse Location</label>
                    <input type="text" value={buyerForm.location} onChange={e => setBuyerForm({...buyerForm, location: e.target.value})} placeholder="APMC Yard, Bengaluru" required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading ? <><FaSpinner className="animate-spin" /> Submitting...</> : <><FaUserPlus /> Submit Registration Request</>}
                </button>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.75rem', textAlign: 'center' }}>
                  After admin verifies your GSTIN &amp; company details, your Buyer ID will be emailed to you.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
