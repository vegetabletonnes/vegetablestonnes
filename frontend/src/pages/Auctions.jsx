import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaClock, FaLocationDot, FaGavel, FaEye, FaCalendar, FaCheck, FaSeedling, FaArrowRight } from 'react-icons/fa6';

const Countdown = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) { setIsExpired(true); setTimeLeft('Ended'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return (
    <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: isExpired ? '#ef4444' : '#fbbf24', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <FaClock /> {timeLeft}
    </span>
  );
};

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/auctions')
      .then(r => { setAuctions(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? auctions : auctions.filter(a => a.status === filter);

  const statusColor = { active: 'badge-live', upcoming: 'badge-blue', closed: 'badge-red' };

  return (
    <div className="page-section">
      <div className="container">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>
            <span className="gradient-text">Produce Tonnage</span> Auctions
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>Direct farm produce auctions managed by VegetableTonnes — competitive transparent bulk bidding</p>
        </motion.div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {['all', 'active', 'upcoming', 'closed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="btn btn-sm"
              style={{
                background: filter === f ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.06)',
                border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color: filter === f ? '#fff' : '#9ca3af',
                textTransform: 'capitalize',
              }}
            >
              {f === 'all' ? 'All Auctions' : f === 'active' ? 'Live' : f === 'upcoming' ? 'Upcoming' : 'Closed'}
            </button>
          ))}
        </div>

        {loading && <div className="spinner" />}

        {!loading && filtered.length === 0 && (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', color: '#22c55e', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <FaSeedling />
            </div>
            <h3>No auctions found</h3>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Check back soon for new listings.</p>
          </div>
        )}

        <div className="grid-3">
          {filtered.map((auc, i) => (
            <motion.div
              key={auc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card"
              style={{ overflow: 'hidden' }}
            >
              <div style={{ position: 'relative' }}>
                <img src={auc.productImage} alt={auc.productName}
                  style={{ width: '100%', height: '190px', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  <span className={`badge ${statusColor[auc.status] || 'badge-green'}`} style={{ textTransform: 'uppercase' }}>
                    {auc.status === 'active' ? 'LIVE' : auc.status === 'upcoming' ? 'Upcoming' : 'Closed'}
                  </span>
                </div>
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', borderRadius: '8px', padding: '4px 10px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#6ee7b7', fontWeight: 700 }}>Qty: {auc.availableStock} Tons</span>
                </div>
              </div>

              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', marginBottom: '4px', color: '#0f172a' }}>{auc.productName}</h3>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaLocationDot style={{ color: '#22c55e', flexShrink: 0 }} /> {auc.location || 'Unknown Location'} · Grade {auc.qualityGrade || 'A'} · {auc.farmerName || 'VegetableTonnes Farm Network'}
                </p>

                <div style={{ background: 'rgba(20,184,166,0.08)', borderRadius: '10px', padding: '10px 12px', marginBottom: '1rem', border: '1px solid rgba(20,184,166,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Starting Price</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Min Order</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>₹{auc.basePrice?.toLocaleString()}/Ton</span>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{auc.minOrder} Tons</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '2px' }}>Current Highest Bid</div>
                    <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#22c55e', fontFamily: 'Outfit, sans-serif' }}>
                      ₹{auc.currentHighestBid?.toLocaleString()}/Ton
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '2px' }}>Total Bids</div>
                    <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '1rem' }}>{auc.totalBids}</div>
                  </div>
                </div>

                {auc.status === 'active' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <Countdown endTime={auc.endTime} />
                  </div>
                )}

                <Link to={`/auctions/${auc.id}`} className={`btn btn-block btn-sm ${auc.status === 'active' ? 'btn-orange' : 'btn-glass'}`}
                  style={{ textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {auc.status === 'active' ? <><FaGavel /> Live Auction</> : auc.status === 'upcoming' ? <><FaEye /> View Details</> : <><FaEye /> View Results</>}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Auctions;
