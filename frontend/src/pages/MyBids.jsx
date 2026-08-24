import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaGavel, FaFilter, FaArrowUpRightFromSquare } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { formatDisplayId } from '../utils/formatId';

const statusMap = {
  pending:        { cls: 'badge-amber',   label: 'Pending Review' },
  approved:       { cls: 'badge-green',   label: 'Accepted' },
  accepted:       { cls: 'badge-green',   label: 'Accepted' },
  rejected:       { cls: 'badge-red',     label: 'Rejected' },
  counter_offered:{ cls: 'badge-blue',    label: 'Counter Offered' },
  counter_offer:  { cls: 'badge-blue',    label: 'Counter Offered' },
  active:         { cls: 'badge-teal',    label: 'Active' },
};

const StatusBadge = ({ status }) => {
  const s = statusMap[status] || { cls: 'badge-neutral', label: status };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
};

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const token = localStorage.getItem('vt_token');
        const res = await axios.get('/api/bids/mine', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBids(res.data);
      } catch {
        toast.error('Failed to load bids');
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  const filtered = filter === 'all' ? bids : bids.filter(b => {
    if (filter === 'active') return b.status === 'pending';
    if (filter === 'accepted') return ['approved', 'accepted'].includes(b.status);
    if (filter === 'rejected') return b.status === 'rejected';
    if (filter === 'counter') return ['counter_offered', 'counter_offer'].includes(b.status);
    return true;
  });

  const stats = {
    total: bids.length,
    active: bids.filter(b => b.status === 'pending').length,
    accepted: bids.filter(b => ['approved', 'accepted'].includes(b.status)).length,
    rejected: bids.filter(b => b.status === 'rejected').length,
    totalValue: bids.reduce((s, b) => s + (b.totalValue || 0), 0),
  };

  return (
    <div className="page-section">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="section-tag"><FaGavel /> Bid Management</span>
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>My Bids</h1>
          </div>

          {/* Stats */}
          <div className="grid-5" style={{ marginBottom: '2rem' }}>
            {[
              { label: 'Total Bids', value: stats.total, color: '#14B8A6' },
              { label: 'Pending Review', value: stats.active, color: '#F59E0B' },
              { label: 'Accepted', value: stats.accepted, color: '#10B981' },
              { label: 'Rejected', value: stats.rejected, color: '#EF4444' },
              { label: 'Total Bid Value', value: `₹${(stats.totalValue / 100000).toFixed(1)}L`, color: '#8B5CF6' },
            ].map(s => (
              <div key={s.label} className="metric-card">
                <div className="metric-value" style={{ color: s.color }}>{s.value}</div>
                <div className="metric-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[
              { key: 'all', label: 'All Bids' },
              { key: 'active', label: 'Pending' },
              { key: 'accepted', label: 'Accepted' },
              { key: 'counter', label: 'Counter Offered' },
              { key: 'rejected', label: 'Rejected' },
            ].map(t => (
              <button
                key={t.key}
                id={`bids-filter-${t.key}`}
                onClick={() => setFilter(t.key)}
                className={`btn btn-sm ${filter === t.key ? 'btn-primary' : 'btn-glass'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            {loading ? <div className="spinner" /> : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                <FaGavel style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.4 }} />
                <p>No bids in this category.</p>
                <Link to="/auctions" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Browse Auctions</Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Bid ID</th>
                      <th>Auction</th>
                      <th>Commodity</th>
                      <th>Qty (Tons)</th>
                      <th>Price/Ton</th>
                      <th>Total Value</th>
                      <th>Destination</th>
                      <th>Status</th>
                      <th>Counter Price</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(b => (
                      <tr key={b.id}>
                        <td><code style={{ color: '#0f766e', fontWeight: 600, fontSize: '0.78rem' }}>{formatDisplayId('BID', b.id)}</code></td>
                        <td style={{ color: '#64748B', fontSize: '0.82rem' }}>{formatDisplayId(b.productName, b.auctionId)}</td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{b.productName || '—'}</td>
                        <td style={{ color: '#0f172a' }}>{b.quantity}</td>
                        <td style={{ color: '#0f172a' }}>₹{b.pricePerTon?.toLocaleString()}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>₹{b.totalValue?.toLocaleString()}</td>
                        <td style={{ color: '#64748B', fontSize: '0.82rem' }}>{b.destination || '—'}</td>
                        <td><StatusBadge status={b.status} /></td>
                        <td>
                          {b.counterPrice ? (
                            <div>
                              <div style={{ color: '#F59E0B', fontWeight: 700 }}>₹{b.counterPrice?.toLocaleString()}/Ton</div>
                              {b.counterNote && <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{b.counterNote}</div>}
                            </div>
                          ) : '—'}
                        </td>
                        <td style={{ color: '#64748B', fontSize: '0.8rem' }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MyBids;
