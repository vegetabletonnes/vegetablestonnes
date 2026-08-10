import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FaClock, FaGavel, FaTrophy, FaArrowLeft, FaSpinner, FaUser, FaBuilding, FaCircleStop } from 'react-icons/fa6';

const Countdown = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) { setExpired(true); return; }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000)
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  if (expired) return (
    <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      <FaCircleStop style={{ color: '#ef4444' }} />
      <span style={{ color: '#ef4444', fontWeight: 700 }}>Auction Ended</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      {[{ val: timeLeft.h, label: 'HRS' }, { val: timeLeft.m, label: 'MIN' }, { val: timeLeft.s, label: 'SEC' }].map(t => (
        <div key={t.label} style={{
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: '10px', padding: '0.75rem 1rem', textAlign: 'center', minWidth: '65px'
        }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>
            {String(t.val).padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.6rem', color: '#6b7280', letterSpacing: '1px', marginTop: '2px' }}>{t.label}</div>
        </div>
      ))}
    </div>
  );
};

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [aucRes, bidsRes] = await Promise.all([
        axios.get(`/api/auctions/${id}`),
        axios.get(`/api/auctions/${id}/bids`)
      ]);
      setAuction(aucRes.data);
      setBids(bidsRes.data);
    } catch (err) {
      toast.error('Auction not found');
      navigate('/auctions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleBid = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { toast.error('Please login to place a bid'); navigate('/auth'); return; }
    if (user.role !== 'buyer') { toast.error('Only buyers can place bids'); return; }

    setSubmitting(true);
    try {
      await axios.post('/api/bids', {
        auctionId: id,
        quantity: Number(qty),
        pricePerTon: Number(price),
      });
      toast.success(`Bid placed! ₹${Number(price).toLocaleString()}/Ton for ${qty} Tons`);
      setQty(''); setPrice('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place bid');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '5rem 0' }}><div className="spinner" /></div>;
  if (!auction) return null;

  const isActive = auction.status === 'active';
  const totalValue = qty && price ? (Number(qty) * Number(price)).toLocaleString() : '—';

  return (
    <div className="page-section">
      <div className="container">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate('/auctions')}
          className="btn btn-glass btn-sm"
          style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <FaArrowLeft /> Back to Auctions
        </motion.button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

          {/* Left: Auction Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="glass-card" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
              <img src={auction.productImage} alt={auction.productName}
                style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span className={`badge ${auction.status === 'active' ? 'badge-live' : 'badge-blue'}`} style={{ marginBottom: '8px', display: 'block', width: 'max-content' }}>
                      {auction.status === 'active' ? 'LIVE AUCTION' : auction.status.toUpperCase()}
                    </span>
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>{auction.productName}</h2>
                    <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>by {auction.farmerName} · {auction.origin}</p>
                  </div>
                  <span className="badge badge-green">{auction.grade}</span>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.6 }}>{auction.description}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1rem', color: '#047857' }}>Auction Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { label: 'Base Price', value: `₹${auction.basePrice?.toLocaleString()}/Ton`, color: '#0f172a' },
                  { label: 'Highest Bid', value: `₹${auction.currentHighestBid?.toLocaleString()}/Ton`, color: '#059669' },
                  { label: 'Available Stock', value: `${auction.availableStock} Tons`, color: '#0f172a' },
                  { label: 'Min Order', value: `${auction.minOrder} Tons`, color: '#0f172a' },
                  { label: 'Total Bids', value: auction.totalBids, color: '#d97706' },
                  { label: 'Total Stock', value: `${auction.totalStock} Tons`, color: '#0f172a' },
                ].map(d => (
                  <div key={d.label} style={{ background: 'rgba(20,184,166,0.08)', borderRadius: '10px', padding: '0.85rem', border: '1px solid rgba(20,184,166,0.15)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '4px' }}>{d.label}</div>
                    <div style={{ fontWeight: 700, color: d.color, fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>{d.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Countdown */}
            {isActive && (
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1rem', textAlign: 'center', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaClock /> Auction Closes In
                </h4>
                <Countdown endTime={auction.endTime} />
              </div>
            )}
          </motion.div>

          {/* Right: Bid Form + Leaderboard */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>

            {/* Bid Form */}
            {isActive && (
              <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaGavel style={{ color: '#22c55e' }} /> Place Your Bid
                </h3>
                {!isLoggedIn ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                    <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Login or register as a buyer to place bids.</p>
                    <button onClick={() => navigate('/auth')} className="btn btn-primary btn-block">Login / Register</button>
                  </div>
                ) : user?.role !== 'buyer' ? (
                  <div style={{ textAlign: 'center', padding: '1rem 0', color: '#f97316' }}>
                    Only registered buyers can place bids
                  </div>
                ) : (
                  <form onSubmit={handleBid}>
                    <div style={{ background: 'rgba(34,197,94,0.08)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#065f46', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaBuilding style={{ color: '#059669' }} /> Bidding as: <strong>{user?.company || user?.name}</strong> ({user?.buyerId || user?.id})
                    </div>
                    <div className="form-group">
                      <label>Quantity Required (Tons)</label>
                      <input type="number" value={qty} onChange={e => setQty(e.target.value)}
                        min={auction.minOrder} max={auction.availableStock}
                        placeholder={`Min: ${auction.minOrder} Tons`} required />
                    </div>
                    <div className="form-group">
                      <label>Your Bid Price per Ton (₹)</label>
                      <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                        min={auction.basePrice}
                        placeholder={`Min: ₹${auction.basePrice?.toLocaleString()}`} required />
                    </div>
                    {qty && price && (
                      <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6b7280', fontSize: '0.88rem' }}>Total Bid Value</span>
                          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#22c55e', fontSize: '1.1rem' }}>₹{totalValue}</span>
                        </div>
                      </div>
                    )}
                    <button type="submit" disabled={submitting} className="btn btn-orange btn-block btn-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      {submitting ? <><FaSpinner className="animate-spin" /> Submitting...</> : <><FaGavel /> Submit Bid</>}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Live Leaderboard */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaTrophy style={{ color: '#fbbf24' }} /> Bid Leaderboard
                </h4>
                <span className="badge badge-green">{bids.length} Bids</span>
              </div>

              {bids.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: '#6b7280' }}>
                  <div style={{ fontSize: '1.8rem', color: '#22c55e', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                    <FaGavel />
                  </div>
                  <p>No bids yet. Be the first!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                  {bids.map((bid, i) => (
                    <motion.div
                      key={bid.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        background: i === 0 ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)',
                        border: i === 0 ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: i === 0 ? '#fbbf24' : '#6b7280' }}>#{i+1}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>{bid.buyerCompany || bid.buyerName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{bid.quantity} Tons</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: i === 0 ? '#fbbf24' : '#22c55e', fontFamily: 'Outfit, sans-serif', fontSize: '1rem' }}>
                          ₹{bid.pricePerTon?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>per Ton</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
