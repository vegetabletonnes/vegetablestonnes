import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaChartBar, FaArrowTrendUp, FaGavel, FaClipboardList } from 'react-icons/fa6';

const Bar = ({ label, value, max, color }) => (
  <div style={{ marginBottom: '0.75rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.82rem' }}>
      <span style={{ color: '#0f172a' }}>{label}</span>
      <span style={{ color: color, fontWeight: 700 }}>{value}</span>
    </div>
    <div style={{ height: 7, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${color}, ${color}88)` }}
      />
    </div>
  </div>
);

const AdminReports = () => {
  const [stats, setStats] = useState(null);
  const [bids, setBids] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('vt_token');
        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, bidsRes, ordersRes] = await Promise.all([
          axios.get('/api/admin/stats', { headers }),
          axios.get('/api/admin/bids', { headers }),
          axios.get('/api/admin/orders', { headers }),
        ]);
        setStats(statsRes.data);
        setBids(bidsRes.data);
        setOrders(ordersRes.data);
      } catch { toast.error('Failed to load reports'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="spinner" />;

  // Commodity distribution from orders
  const commodityCounts = {};
  orders.forEach(o => {
    commodityCounts[o.commodity] = (commodityCounts[o.commodity] || 0) + 1;
  });
  const topCommodities = Object.entries(commodityCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxComm = Math.max(...topCommodities.map(([, v]) => v), 1);

  // Bid status distribution
  const bidStatuses = {};
  bids.forEach(b => { bidStatuses[b.status] = (bidStatuses[b.status] || 0) + 1; });

  // Order status distribution
  const orderStatuses = {};
  orders.forEach(o => { orderStatuses[o.status] = (orderStatuses[o.status] || 0) + 1; });

  const acceptanceRate = bids.length > 0
    ? Math.round((bids.filter(b => ['approved', 'accepted'].includes(b.status)).length / bids.length) * 100)
    : 0;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, marginBottom: '0.25rem' }}>Reports & Analytics</h2>
        <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Platform performance overview</p>
      </div>

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { l: 'Total Revenue', v: `₹${((stats?.totalRevenue || 0) / 100000).toFixed(1)}L`, c: '#14B8A6', icon: <FaArrowTrendUp /> },
          { l: 'Tons Traded', v: (stats?.totalTonsTraded || 0).toLocaleString(), c: '#10B981', icon: <FaChartBar /> },
          { l: 'Bid Acceptance Rate', v: `${acceptanceRate}%`, c: '#F59E0B', icon: <FaGavel /> },
          { l: 'Total Orders', v: stats?.totalOrders || 0, c: '#8B5CF6', icon: <FaClipboardList /> },
        ].map(s => (
          <div key={s.l} className="metric-card">
            <div className="metric-icon" style={{ color: s.c }}>{s.icon}</div>
            <div className="metric-value" style={{ color: s.c }}>{s.v}</div>
            <div className="metric-label">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Top Commodities */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1rem', marginBottom: '1.25rem' }}>Top Commodities by Orders</h3>
          {topCommodities.length === 0 ? (
            <p style={{ color: '#64748B', fontSize: '0.85rem' }}>No order data yet.</p>
          ) : (
            topCommodities.map(([commodity, count]) => (
              <Bar key={commodity} label={commodity} value={count} max={maxComm} color="#14B8A6" />
            ))
          )}
        </div>

        {/* Bid Status Breakdown */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1rem', marginBottom: '1.25rem' }}>Bid Status Breakdown</h3>
          {Object.entries(bidStatuses).length === 0 ? (
            <p style={{ color: '#64748B', fontSize: '0.85rem' }}>No bid data yet.</p>
          ) : (
            Object.entries(bidStatuses).map(([status, count]) => {
              const colors = { pending: '#F59E0B', approved: '#10B981', accepted: '#10B981', rejected: '#EF4444', counter_offered: '#3B82F6' };
              return (
                <Bar key={status} label={status.replace('_', ' ')} value={count} max={bids.length} color={colors[status] || '#14B8A6'} />
              );
            })
          )}
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1rem', marginBottom: '1.25rem' }}>Order Status Distribution</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {Object.entries(orderStatuses).map(([status, count]) => (
            <div key={status} style={{ padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', minWidth: 100 }}>
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#14B8A6' }}>{count}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'capitalize', marginTop: '2px' }}>{status.replace(/_/g, ' ')}</div>
            </div>
          ))}
          {Object.keys(orderStatuses).length === 0 && (
            <p style={{ color: '#64748B', fontSize: '0.85rem' }}>No orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
