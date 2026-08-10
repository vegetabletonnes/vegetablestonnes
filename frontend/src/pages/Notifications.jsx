import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaBell, FaCircleCheck, FaGavel, FaFileInvoiceDollar, FaTruck, FaCreditCard, FaCheck } from 'react-icons/fa6';

const TYPE_CONFIG = {
  bid_submitted:    { icon: <FaGavel />,              color: '#14B8A6', bg: 'rgba(20,184,166,0.12)' },
  bid_accepted:     { icon: <FaCircleCheck />,        color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  bid_rejected:     { icon: <FaGavel />,              color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  counter_offer:    { icon: <FaGavel />,              color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  payment_received: { icon: <FaCreditCard />,         color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  invoice_generated:{ icon: <FaFileInvoiceDollar />,  color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  dispatched:       { icon: <FaTruck />,              color: '#14B8A6', bg: 'rgba(20,184,166,0.12)' },
  delivered:        { icon: <FaCircleCheck />,        color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
};

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const token = localStorage.getItem('vt_token');
      const res = await axios.get('/api/notifications/mine', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifs(res.data);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('vt_token');
      await axios.post('/api/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifs(n => n.map(x => ({ ...x, read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markRead = async (id) => {
    try {
      const token = localStorage.getItem('vt_token');
      await axios.post(`/api/notifications/mark-read/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
    } catch {}
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="page-section">
      <div className="container" style={{ maxWidth: 800 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="section-tag"><FaBell /> Alerts</span>
              <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{
                    marginLeft: '0.75rem', background: '#EF4444', color: '#fff',
                    borderRadius: '50%', width: 28, height: 28,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 800, verticalAlign: 'middle',
                  }}>{unreadCount}</span>
                )}
              </h1>
            </div>
            {unreadCount > 0 && (
              <button id="notifs-mark-all-btn" onClick={markAllRead} className="btn btn-glass btn-sm">
                <FaCheck /> Mark All Read
              </button>
            )}
          </div>

          <div className="glass-card" style={{ padding: '0.5rem', overflow: 'hidden' }}>
            {loading ? <div className="spinner" /> : notifs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                <FaBell style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                <p>No notifications yet. Activity on your bids and orders will appear here.</p>
              </div>
            ) : (
              notifs.map((n, i) => {
                const cfg = TYPE_CONFIG[n.type] || { icon: <FaBell />, color: '#14B8A6', bg: 'rgba(20,184,166,0.10)' };
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => !n.read && markRead(n.id)}
                    id={`notif-item-${n.id}`}
                    style={{
                      display: 'flex', gap: '1rem', padding: '1rem 1.25rem',
                      borderRadius: '10px', cursor: !n.read ? 'pointer' : 'default',
                      borderLeft: !n.read ? `3px solid ${cfg.color}` : '3px solid transparent',
                      background: !n.read ? `${cfg.color}06` : 'transparent',
                      marginBottom: '2px',
                      transition: 'background 0.18s',
                    }}
                  >
                    <div style={{
                      width: 42, height: 42, borderRadius: '12px',
                      background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: cfg.color, fontSize: '1rem', flexShrink: 0,
                    }}>
                      {cfg.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: n.read ? 500 : 700, fontSize: '0.92rem', color: '#0f172a' }}>{n.title}</div>
                        {!n.read && <span className="badge badge-teal" style={{ fontSize: '0.62rem' }}>New</span>}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px', lineHeight: 1.6 }}>{n.message}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                        {new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;
