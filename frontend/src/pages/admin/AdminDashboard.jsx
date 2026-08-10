import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaUsers, FaGavel, FaCoins, FaBox, FaChartLine, FaPlus, FaCheckDouble, FaSeedling, FaArrowRight } from 'react-icons/fa6';

const StatCard = ({ icon, label, value, color, sub }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card"
    style={{ padding: '1.5rem', borderLeft: `3px solid ${color}` }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</div>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>{sub}</div>}
      </div>
      <div style={{ fontSize: '1.5rem', color, opacity: 0.8 }}>{icon}</div>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/stats')
      .then(r => { setStats(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>Company Management Dashboard</h2>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Real-time platform metrics & auction operations</p>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard icon={<FaUsers />} label="Total Registered Users" value={stats?.totalUsers || 0} color="#22c55e" sub={`${stats?.totalBuyers} Enterprise Buyers`} />
        <StatCard icon={<FaGavel />} label="Active Auctions" value={stats?.activeAuctions || 0} color="#fbbf24" sub={`${stats?.totalAuctions} Total auctions`} />
        <StatCard icon={<FaCoins />} label="Total Bids" value={stats?.totalBids || 0} color="#f97316" sub={`${stats?.pendingBids} Pending review`} />
        <StatCard icon={<FaBox />} label="Total Orders" value={stats?.totalOrders || 0} color="#60a5fa" sub={`₹${((stats?.totalRevenue || 0)/100000).toFixed(1)}L Total value`} />
      </div>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h4 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaChartLine style={{ color: '#22c55e' }} /> Key Metrics
          </h4>
          {[
            { label: 'Tons Traded', value: `${stats?.totalTonsTraded || 0} Tons` },
            { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}` },
            { label: 'Verified Buyers', value: stats?.totalBuyers || 0 },
            { label: 'Farm Produce Catalog', value: stats?.totalProducts || 0 },
          ].map(m => (
            <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
              <span style={{ color: '#6b7280', fontSize: '0.88rem' }}>{m.label}</span>
              <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>{m.value}</span>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h4 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaPlus style={{ color: '#22c55e' }} /> Quick Actions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Add Farm Produce Listing', href: '/admin/products', color: '#22c55e' },
              { label: 'Create Live Auction', href: '/admin/auctions', color: '#f97316' },
              { label: 'Review Pending Bids', href: '/admin/bids', color: '#fbbf24' },
              { label: 'Verify Buyer Accounts', href: '/admin/users', color: '#60a5fa' },
            ].map(a => (
              <a key={a.label} href={a.href} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', textDecoration: 'none',
                background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`,
                color: a.color, fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s',
              }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              >
                <span>{a.label}</span>
                <FaArrowRight style={{ fontSize: '0.75rem' }} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(249,115,22,0.06))' }}>
        <div style={{ fontSize: '1.5rem', color: '#22c55e', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
          <FaSeedling />
        </div>
        <h4 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.4rem' }}>VegetableTonnes Operations</h4>
        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
          Platform status is <strong style={{ color: '#22c55e' }}>Live</strong> · {stats?.activeAuctions} active auctions · {stats?.pendingBids} bids awaiting review
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
